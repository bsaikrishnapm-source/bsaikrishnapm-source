"""Fictional projects generated relative to the review day."""
from datetime import date, timedelta


def demo_projects(today=None):
    today=today or date.today()
    def d(offset): return (today+timedelta(days=offset)).isoformat()
    def task(i,title,owner,points,start,due,progress,status,updated=-1,deps=(),current_due=None,baseline=None):
        return dict(id=i,title=title,owner=owner,points=points,baseline_points=points if baseline is None else baseline,
                    baseline_start=d(start),baseline_due=d(due),due_date=d(due if current_due is None else current_due),
                    progress=progress,status=status,updated_at=d(updated),depends_on=list(deps),
                    completed_at=d(updated) if status=='done' else None,blocked_since=d(-5) if status=='blocked' else None)
    risk=dict(id='atlas',name='Atlas Partner API',owner='Morgan · PM',objective='Launch partner self-service onboarding with reliable API access.',
              baseline=dict(start_date=d(-28),target_date=d(14),budget=80000,scope_points=100),spent=61000,
              team=[dict(name='Alex',weekly_capacity=15),dict(name='Sam',weekly_capacity=18),dict(name='Riley',weekly_capacity=12)],
              quality=dict(open_critical=2,open_high=6,total_tests=120,failed_tests=19),
              decisions=[dict(id='D1',title='Partner authentication approach',owner='Platform lead',due_date=d(-3),status='open')],
              tasks=[task('A1','Discovery and acceptance criteria','Alex',10,-28,-22,100,'done',-22),
                     task('A2','Authentication contract','Alex',20,-21,-6,60,'blocked',-9),
                     task('A3','Partner sandbox','Alex',20,-16,-1,35,'in_progress',deps=['A2']),
                     task('A4','Self-service setup','Sam',20,-10,5,25,'in_progress',deps=['A3']),
                     task('A5','Contract and regression tests','Riley',15,-7,9,10,'in_progress',deps=['A3']),
                     task('A6','Pilot and operational handoff','Sam',15,5,14,0,'todo',deps=['A4','A5']),
                     task('A7','Added bulk-import requirement','Alex',25,-4,4,0,'todo',baseline=0)])
    healthy=dict(id='pulse',name='Pulse Analytics Refresh',owner='Taylor · PM',objective='Make activation metrics consistent across customer teams.',
                 baseline=dict(start_date=d(-20),target_date=d(20),budget=50000,scope_points=40),spent=18000,
                 team=[dict(name='Jamie',weekly_capacity=15),dict(name='Casey',weekly_capacity=20)],
                 quality=dict(open_critical=0,open_high=1,total_tests=60,failed_tests=1),decisions=[],
                 tasks=[task('P1','Agree event definitions','Jamie',10,-20,-10,100,'done',-10),
                        task('P2','Build activation model','Casey',20,-10,10,50,'in_progress'),
                        task('P3','Publish dashboard and guide','Jamie',10,10,20,0,'todo',deps=['P2'])])
    return [risk,healthy]
