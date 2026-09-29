"""SQLite-backed alerts and project snapshots for a single local workspace."""
from datetime import date, datetime, timezone
from contextlib import contextmanager
import json
from pathlib import Path
import sqlite3
import threading
from engine import analyze, brief, validate, preserve_baseline, ValidationError, day
from samples import demo_projects


class Store:
    def __init__(self, path):
        self.path=str(path)
        Path(path).parent.mkdir(parents=True,exist_ok=True)
        self.lock=threading.RLock()
        with self.connect() as db:
            db.executescript('''
            CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, body TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS alerts(id TEXT PRIMARY KEY, project_id TEXT, body TEXT, state TEXT, first_seen TEXT, last_seen TEXT);
            CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY, project_id TEXT, scanned_at TEXT, body TEXT);
            CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
            ''')
            if not db.execute('SELECT 1 FROM projects LIMIT 1').fetchone():
                for p in demo_projects():
                    validate(p)
                    db.execute('INSERT INTO projects VALUES(?,?)',(p['id'],json.dumps(p)))
        self.scan()

    @contextmanager
    def connect(self):
        db=sqlite3.connect(self.path,timeout=10)
        try:
            with db:
                yield db
        finally:
            db.close()

    def projects(self,db):
        return [json.loads(row[0]) for row in db.execute('SELECT body FROM projects ORDER BY id')]

    def as_of(self,db):
        row=db.execute("SELECT value FROM settings WHERE key='as_of'").fetchone()
        return row[0] if row and row[0] else date.today().isoformat()

    def scan(self):
        with self.lock, self.connect() as db:
            return self._scan(db)

    def _scan(self,db):
        now=datetime.now(timezone.utc).isoformat(timespec='seconds')
        as_of=self.as_of(db)
        for p in self.projects(db):
            result=analyze(p,as_of)
            active=set()
            for a in result['alerts']:
                active.add(a['id'])
                old=db.execute('SELECT body,state,first_seen FROM alerts WHERE id=?',(a['id'],)).fetchone()
                state='open'
                if old and old[1]=='acknowledged' and json.loads(old[0])['fingerprint']==a['fingerprint']:
                    state='acknowledged'
                first=old[2] if old and old[1]!='resolved' else now
                db.execute('INSERT OR REPLACE INTO alerts VALUES(?,?,?,?,?,?)',(a['id'],p['id'],json.dumps(a),state,first,now))
            for (aid,) in db.execute("SELECT id FROM alerts WHERE project_id=? AND state!='resolved'",(p['id'],)).fetchall():
                if aid not in active:
                    db.execute("UPDATE alerts SET state='resolved', last_seen=? WHERE id=?",(now,aid))
            body=json.dumps(result,sort_keys=True)
            last=db.execute('SELECT body FROM history WHERE project_id=? ORDER BY id DESC LIMIT 1',(p['id'],)).fetchone()
            if not last or last[0]!=body:
                db.execute('INSERT INTO history(project_id,scanned_at,body) VALUES(?,?,?)',(p['id'],now,body))
                db.execute('DELETE FROM history WHERE project_id=? AND id NOT IN (SELECT id FROM history WHERE project_id=? ORDER BY id DESC LIMIT 100)',(p['id'],p['id']))
        db.execute("INSERT OR REPLACE INTO settings VALUES('last_scan',?)",(now,))
        return now

    def state(self):
        with self.lock, self.connect() as db:
            projects=self.projects(db)
            result=[]
            for p in projects:
                row=db.execute('SELECT body FROM history WHERE project_id=? ORDER BY id DESC LIMIT 1',(p['id'],)).fetchone()
                report=json.loads(row[0])
                result.append(dict(project=p,report=report,brief=brief(report)))
            alerts=[dict(**json.loads(body),state=state,first_seen=first,last_seen=last) for body,state,first,last in db.execute('SELECT body,state,first_seen,last_seen FROM alerts ORDER BY id')]
            last=db.execute("SELECT value FROM settings WHERE key='last_scan'").fetchone()
            return dict(projects=result,alerts=alerts,as_of=self.as_of(db),last_scan=last[0] if last else None)

    def import_project(self,p):
        validate(p)
        with self.lock, self.connect() as db:
            old=db.execute('SELECT body FROM projects WHERE id=?',(p['id'],)).fetchone()
            if old:
                preserve_baseline(json.loads(old[0]),p)
            elif db.execute('SELECT count(*) FROM projects').fetchone()[0]>=20:
                raise ValidationError('Local workspace limit: 20 projects')
            db.execute('INSERT OR REPLACE INTO projects VALUES(?,?)',(p['id'],json.dumps(p)))
            self._scan(db)

    def update_task(self,pid,tid,changes):
        allowed={'status','progress','owner','due_date'}
        if not changes or set(changes)-allowed:
            raise ValidationError('Only status, progress, owner and due_date can be edited here')
        with self.lock, self.connect() as db:
            row=db.execute('SELECT body FROM projects WHERE id=?',(pid,)).fetchone()
            if not row:
                raise ValidationError('Unknown project')
            p=json.loads(row[0])
            task=next((t for t in p['tasks'] if t['id']==tid),None)
            if not task:
                raise ValidationError('Unknown task')
            task.update(changes)
            task['updated_at']=date.today().isoformat()
            task['completed_at']=task.get('completed_at') or date.today().isoformat() if task['status']=='done' else None
            task['blocked_since']=(task.get('blocked_since') or date.today().isoformat()) if task['status']=='blocked' else None
            validate(p)
            db.execute('UPDATE projects SET body=? WHERE id=?',(json.dumps(p),pid))
            self._scan(db)

    def acknowledge(self,aid):
        with self.lock, self.connect() as db:
            row=db.execute('SELECT state FROM alerts WHERE id=?',(aid,)).fetchone()
            if not row or row[0]=='resolved':
                raise ValidationError('No active alert with that ID')
            db.execute("UPDATE alerts SET state='acknowledged' WHERE id=?",(aid,))

    def update_status(self,pid,changes):
        if not changes or set(changes)-{'spent','quality','decisions','team'}:
            raise ValidationError('Only spend, quality, decisions and team capacity may change')
        with self.lock, self.connect() as db:
            row=db.execute('SELECT body FROM projects WHERE id=?',(pid,)).fetchone()
            if not row: raise ValidationError('Unknown project')
            p=json.loads(row[0]);p.update(changes);validate(p)
            db.execute('UPDATE projects SET body=? WHERE id=?',(json.dumps(p),pid))
            self._scan(db)

    def add_task(self,pid,task):
        with self.lock, self.connect() as db:
            row=db.execute('SELECT body FROM projects WHERE id=?',(pid,)).fetchone()
            if not row: raise ValidationError('Unknown project')
            p=json.loads(row[0])
            if task.get('baseline_points')!=0: raise ValidationError('Added work must have zero baseline points')
            p['tasks'].append(task);validate(p)
            db.execute('UPDATE projects SET body=? WHERE id=?',(json.dumps(p),pid))
            self._scan(db)

    def set_date(self,value):
        if value:
            day(value)
        with self.lock, self.connect() as db:
            db.execute("INSERT OR REPLACE INTO settings VALUES('as_of',?)",(value or '',))
            self._scan(db)

    def history(self,pid):
        with self.lock, self.connect() as db:
            return [dict(scanned_at=ts,**json.loads(body)) for ts,body in db.execute('SELECT scanned_at,body FROM history WHERE project_id=? ORDER BY id DESC LIMIT 20',(pid,))][::-1]
