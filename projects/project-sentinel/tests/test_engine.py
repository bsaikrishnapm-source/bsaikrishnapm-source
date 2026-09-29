import unittest
from copy import deepcopy
from datetime import date
from engine import analyze,validate,preserve_baseline,ValidationError
from samples import demo_projects
from assistant import local_brief
import json

class EngineTests(unittest.TestCase):
    def setUp(self): self.risk,self.healthy=demo_projects(date(2026,9,29))
    def report(self,p=None): return analyze(p or self.risk,'2026-09-29')
    def test_healthy_is_on_track(self):
        r=self.report(self.healthy);self.assertEqual(r['health'],'On track');self.assertEqual(r['alerts'],[]);self.assertEqual(r['metrics']['actual'],50)
    def test_baseline_progress_not_inflated_by_added_scope(self):
        r=self.report();self.assertEqual(r['metrics']['actual'],35.5);self.assertEqual(r['metrics']['completion'],28.4)
    def test_expected_progress_is_weighted_and_date_bounded(self):
        self.assertEqual(analyze(self.healthy,'2026-01-01')['metrics']['expected'],0)
        self.assertEqual(analyze(self.healthy,'2027-01-01')['metrics']['expected'],100)
        self.assertEqual(self.report()['metrics']['expected'],69.9)
    def test_risk_covers_core_failure_modes(self):
        self.assertTrue({'schedule','scope','budget','dependency','capacity','quality','decision','data','overdue'} <= {a['code'] for a in self.report()['alerts']})
    def test_date_change_cannot_hide_baseline_slip(self):
        self.risk['tasks'][1]['due_date']='2026-10-20'
        self.assertTrue(any(a['code']=='slippage' for a in self.report()['alerts']))
    def test_done_task_not_overdue(self):
        t=self.risk['tasks'][1];t.update(status='done',progress=100,completed_at='2026-09-29')
        self.assertFalse(any(a['code']=='overdue' and 'A2' in a['task_ids'] for a in self.report()['alerts']))
    def test_unowned_task_flags_accountability(self):
        self.healthy['tasks'][1]['owner']='';self.assertTrue(any(a['code']=='ownership' for a in self.report(self.healthy)['alerts']))
    def test_future_update_is_not_treated_as_historical_evidence(self):
        self.healthy['tasks'][1]['updated_at']='2026-10-01';self.assertEqual(self.report(self.healthy)['metrics']['data_confidence'],'Needs fresh data')
    def test_zero_progress_has_no_finish_forecast(self):
        for t in self.healthy['tasks']:t.update(status='todo',progress=0,completed_at=None)
        self.assertIsNone(self.report(self.healthy)['metrics']['forecast'])
    def test_completed_scope_has_no_remaining_forecast(self):
        for t in self.healthy['tasks']:t.update(status='done',progress=100,completed_at='2026-09-29')
        self.assertIsNone(self.report(self.healthy)['metrics']['forecast'])
    def test_no_mutation(self):
        before=deepcopy(self.risk);self.report();self.assertEqual(before,self.risk)
    def test_negative_nan_and_zero_budget_rejected(self):
        for value in (-1,0,float('nan'),True):
            p=deepcopy(self.risk);p['baseline']['budget']=value
            with self.assertRaises(ValidationError):validate(p)
    def test_missing_dependency_and_cycle_rejected(self):
        for dep in ('missing','A3'):
            p=deepcopy(self.risk);p['tasks'][1]['depends_on']=[dep]
            with self.assertRaises(ValidationError):validate(p)
    def test_duplicate_task_ids_rejected(self):
        self.risk['tasks'][1]['id']='A1'
        with self.assertRaises(ValidationError):validate(self.risk)
    def test_ids_cannot_collide_with_alert_key_delimiters(self):
        self.risk['id']='atlas:quality'
        with self.assertRaises(ValidationError):validate(self.risk)
    def test_inconsistent_status_rejected(self):
        self.risk['tasks'][1]['status']='done'
        with self.assertRaises(ValidationError):validate(self.risk)
    def test_quality_counts_checked(self):
        self.risk['quality']['failed_tests']=999
        with self.assertRaises(ValidationError):validate(self.risk)
    def test_baseline_edits_and_task_removal_rejected(self):
        p=deepcopy(self.risk);p['baseline']['target_date']='2026-12-01'
        with self.assertRaises(ValidationError):preserve_baseline(self.risk,p)
        p=deepcopy(self.risk);p['tasks'].pop(0)
        with self.assertRaises(ValidationError):preserve_baseline(self.risk,p)
    def test_new_scope_allowed_without_rebaseline(self):
        p=deepcopy(self.healthy);t=deepcopy(p['tasks'][2]);t.update(id='P4',baseline_points=0);p['tasks'].append(t)
        validate(p);preserve_baseline(self.healthy,p)
        self.assertEqual(self.report(p)['metrics']['scope_growth'],25)
    def test_unknown_model_citation_falls_back(self):
        response={'message':{'content':json.dumps({'summary':'Draft','actions':[{'alert_id':'unknown','action':'Invented'}]})}}
        b=local_brief(self.report(),'fake',lambda _:response);self.assertEqual(b['source'],'Evidence rules');self.assertIn('notice',b)
    def test_valid_model_response_is_labelled_draft(self):
        r=self.report();aid=r['alerts'][0]['id']
        response={'message':{'content':json.dumps({'summary':'Review the flagged dependency.','actions':[{'alert_id':aid,'action':'Discuss the supplied evidence with the owner.'}]})}}
        b=local_brief(r,'fake',lambda _:response);self.assertIn('draft',b['source']);self.assertEqual(b['actions'][0]['owner'],r['alerts'][0]['owner'])
    def test_model_failure_does_not_disable_monitor(self):
        def fail(_):raise TimeoutError()
        self.assertEqual(local_brief(self.report(),'fake',fail)['source'],'Evidence rules')

if __name__=='__main__':unittest.main()
