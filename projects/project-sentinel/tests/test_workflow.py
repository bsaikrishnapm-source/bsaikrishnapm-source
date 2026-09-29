import unittest,tempfile,json,threading
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from store import Store
from app import make_server
from engine import ValidationError

class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'test.sqlite3';self.store=Store(self.path)
    def tearDown(self):self.tmp.cleanup()
    def alert(self,code='quality'):
        return next(a for a in self.store.state()['alerts'] if a['project_id']=='atlas' and a['code']==code)
    def risk(self):return next(p['project'] for p in self.store.state()['projects'] if p['project']['id']=='atlas')
    def test_acknowledgement_survives_scan_and_restart(self):
        aid=self.alert()['id'];self.store.acknowledge(aid);self.store.scan();other=Store(self.path)
        self.assertEqual(next(a for a in other.state()['alerts'] if a['id']==aid)['state'],'acknowledged')
    def test_changed_evidence_reopens_acknowledged_alert(self):
        aid=self.alert()['id'];self.store.acknowledge(aid);p=self.risk();p['quality']['open_critical']+=1;self.store.import_project(p)
        self.assertEqual(self.alert()['state'],'open')
    def test_condition_clear_resolves_and_recurrence_reopens(self):
        p=self.risk();p['quality']=dict(open_critical=0,open_high=0,total_tests=120,failed_tests=0);self.store.import_project(p)
        self.assertEqual(self.alert()['state'],'resolved')
        p['quality']['open_critical']=1;self.store.import_project(p);self.assertEqual(self.alert()['state'],'open')
    def test_invalid_import_is_atomic(self):
        before=self.store.state()['projects'];p=self.risk();p['baseline']['budget']+=100
        with self.assertRaises(ValidationError):self.store.import_project(p)
        self.assertEqual(self.store.state()['projects'],before)
    def test_task_updates_preserve_baseline_and_scan(self):
        p=self.risk();t=p['tasks'][1];baseline=t['baseline_due'];self.store.update_task('atlas','A2',{'status':'done','progress':100,'owner':'Alex','due_date':t['due_date']})
        self.assertEqual(self.risk()['tasks'][1]['baseline_due'],baseline)
        self.assertEqual(self.risk()['tasks'][1]['status'],'done')
        self.assertFalse(any(a['code']=='overdue' and a['task_ids']==['A2'] and a['state']!='resolved' for a in self.store.state()['alerts']))
    def test_repeated_identical_scan_does_not_duplicate_alerts_or_history(self):
        n=len(self.store.state()['alerts']);h=len(self.store.history('atlas'));self.store.scan();self.store.scan()
        self.assertEqual(len(self.store.state()['alerts']),n);self.assertEqual(len(self.store.history('atlas')),h)
    def test_import_creates_distinct_project(self):
        p=self.risk();p['id']='my-project';self.store.import_project(p);self.assertEqual(len(self.store.state()['projects']),3)

class HttpTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'test.sqlite3');self.server=make_server(self.store,port=0,interval=.1)
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start();self.base='http://127.0.0.1:'+str(self.server.server_port)
    def tearDown(self):self.server.stop_monitor();self.server.shutdown();self.server.server_close();self.tmp.cleanup()
    def req(self,path,data=None,headers=None):
        headers=headers or {}
        if data is not None:headers.setdefault('Content-Type','application/json')
        return urlopen(Request(self.base+path,data=json.dumps(data).encode() if data is not None else None,headers=headers),timeout=5)
    def test_serves_ui_and_state(self):
        with self.req('/') as r:self.assertIn(b'Project Sentinel',r.read())
        with self.req('/api/state') as r:self.assertEqual(len(json.load(r)['projects']),2)
    def test_full_http_edit_ack_export_flow(self):
        state=json.load(self.req('/api/state'));a=next(a for a in state['alerts'] if a['code']=='quality')
        result=json.load(self.req('/api/acknowledge',{'alert_id':a['id']}));self.assertEqual(next(x for x in result['alerts'] if x['id']==a['id'])['state'],'acknowledged')
        self.req('/api/task',{'project_id':'atlas','task_id':'A2','changes':{'status':'done','progress':100}}).close()
        saved=json.load(self.req('/api/state'));p2=next(x['project'] for x in saved['projects'] if x['project']['id']=='atlas');self.assertEqual(p2['tasks'][1]['progress'],100)
        self.req('/api/import',{'project':p2}).close()
        self.assertEqual(json.load(self.req('/api/brief',{'project_id':'atlas'}))['source'],'Evidence rules')
    def test_invalid_import_returns_400(self):
        with self.assertRaises(HTTPError) as c:self.req('/api/import',{'project':{'id':'bad'}})
        self.assertEqual(c.exception.code,400)
    def test_cross_origin_post_rejected(self):
        with self.assertRaises(HTTPError) as c:self.req('/api/scan',{}, {'Origin':'https://example.com'})
        self.assertEqual(c.exception.code,403)
    def test_wrong_host_and_private_file_not_served(self):
        with self.assertRaises(HTTPError) as c:self.req('/api/state',headers={'Host':'evil.example'})
        self.assertEqual(c.exception.code,403)
        with self.assertRaises(HTTPError) as c:self.req('/data/sentinel.sqlite3')
        self.assertEqual(c.exception.code,404)
    def test_monitor_reads_valid_watch_changes_and_retains_last_valid_on_error(self):
        watched=Path(self.tmp.name)/'project.json';p=self.store.state()['projects'][0]['project'];p['id']='watched';watched.write_text(json.dumps(p))
        server=make_server(self.store,port=0,watch=str(watched),interval=99)
        try:
            self.assertTrue(any(x['project']['id']=='watched' for x in self.store.state()['projects']))
            watched.write_text('{broken');server.monitor_once()
            self.assertTrue(any(x['project']['id']=='watched' for x in self.store.state()['projects']))
        finally:server.stop_monitor();server.server_close()
    def test_background_monitor_runs_without_browser(self):
        event=threading.Event();original=self.store.scan
        def scan():event.set();return original()
        self.store.scan=scan
        self.assertTrue(event.wait(2))

if __name__=='__main__':unittest.main()

class EvidenceEditTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.store=Store(Path(self.tmp.name)/'test.sqlite3')
    def tearDown(self):self.tmp.cleanup()
    def test_budget_quality_and_decision_updates_recheck(self):
        p=next(x['project'] for x in self.store.state()['projects'] if x['project']['id']=='atlas')
        changes={'spent':1000,'quality':dict(open_critical=0,open_high=0,total_tests=120,failed_tests=0),'decisions':[dict(**{k:v for k,v in d.items() if k!='status'},status='decided') for d in p['decisions']]}
        self.store.update_status('atlas',changes)
        active=[a['code'] for a in self.store.state()['alerts'] if a['project_id']=='atlas' and a['state']!='resolved']
        self.assertNotIn('quality',active);self.assertNotIn('budget',active);self.assertNotIn('decision',active)
    def test_new_scope_keeps_baseline_and_adds_warning(self):
        from datetime import date,timedelta
        today=date.today().isoformat();due=(date.today()+timedelta(days=10)).isoformat()
        t=dict(id='new',title='New request',owner='Jamie',points=10,baseline_points=0,baseline_start=today,baseline_due=due,due_date=due,progress=0,status='todo',updated_at=today,completed_at=None,blocked_since=None,depends_on=[])
        self.store.add_task('pulse',t)
        p=next(x for x in self.store.state()['projects'] if x['project']['id']=='pulse')
        self.assertEqual(p['project']['baseline']['scope_points'],40);self.assertEqual(p['report']['metrics']['scope_growth'],25)
    def test_added_scope_cannot_change_baseline_points(self):
        p=self.store.state()['projects'][0]['project'];t=dict(p['tasks'][0]);t['id']='forbidden'
        with self.assertRaises(ValidationError):self.store.add_task(p['id'],t)
