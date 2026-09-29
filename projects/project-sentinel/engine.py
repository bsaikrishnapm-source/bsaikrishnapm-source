"""Evidence-based project monitoring. Standard library only; no model required."""
from __future__ import annotations
from datetime import date, timedelta
import hashlib
import json
import math
import re


class ValidationError(ValueError):
    pass


def day(value):
    try:
        result = date.fromisoformat(value)
        if result.isoformat() != value:
            raise ValueError()
        return result
    except (ValueError, TypeError):
        raise ValidationError(f"Invalid ISO date: {value!r}") from None


def number(value, name, low=0, high=10**9):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
        raise ValidationError(f"{name} must be a finite number from {low} to {high}")


def text(value, name, empty=False):
    if not isinstance(value, str) or (not empty and not value.strip()) or len(value) > 2000:
        raise ValidationError(f"Invalid {name}")


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', value):
        raise ValidationError('IDs must use 1–100 letters, digits, underscores or hyphens')


def validate(p):
    try:
        for key in ('id', 'name', 'owner', 'objective'):
            text(p[key], key)
        identifier(p['id'])
        b = p['baseline']
        if day(b['target_date']) <= day(b['start_date']):
            raise ValidationError('Target must follow start date')
        number(b['budget'], 'budget', 1)
        number(b['scope_points'], 'baseline scope', 1)
        number(p['spent'], 'spent')
        tasks = p['tasks']
        if not isinstance(tasks, list) or not 1 <= len(tasks) <= 500:
            raise ValidationError('Provide 1–500 tasks')
        ids = set()
        for t in tasks:
            for key in ('id', 'title'):
                text(t[key], key)
            identifier(t['id'])
            text(t['owner'], 'task owner', empty=True)
            if t['id'] in ids:
                raise ValidationError('Duplicate task ID')
            ids.add(t['id'])
            number(t['points'], 'points', 0.01, 10000)
            number(t['baseline_points'], 'baseline_points', 0, 10000)
            number(t['progress'], 'progress', 0, 100)
            if t['status'] not in ('todo', 'in_progress', 'blocked', 'done'):
                raise ValidationError('Invalid task status')
            if (t['status'] == 'done') != (t['progress'] == 100) or (t['status'] == 'todo' and t['progress'] != 0):
                raise ValidationError('Done requires 100%; todo requires 0%')
            if day(t['baseline_due']) < day(t['baseline_start']):
                raise ValidationError('Task baseline due precedes start')
            for key in ('due_date', 'updated_at'):
                day(t[key])
            if t.get('completed_at'):
                day(t['completed_at'])
            if t['status'] == 'done' and not t.get('completed_at'):
                raise ValidationError('Completed task needs completed_at')
            if t['status'] != 'done' and t.get('completed_at'):
                raise ValidationError('Incomplete task cannot have completed_at')
            if t.get('blocked_since'):
                day(t['blocked_since'])
            if not isinstance(t['depends_on'], list) or len(t['depends_on']) != len(set(t['depends_on'])):
                raise ValidationError('Invalid dependency list')
        if abs(sum(t['baseline_points'] for t in tasks) - b['scope_points']) > .001:
            raise ValidationError('Baseline task points must sum to baseline scope_points')
        graph = {t['id']: t['depends_on'] for t in tasks}
        seen, active = set(), set()
        def visit(i):
            if i not in graph:
                raise ValidationError(f'Missing dependency: {i}')
            if i in active:
                raise ValidationError('Dependency cycle')
            if i in seen:
                return
            active.add(i)
            for dep in graph[i]:
                visit(dep)
            active.remove(i)
            seen.add(i)
        for i in graph:
            visit(i)
        owners = set()
        for o in p['team']:
            text(o['name'], 'team member')
            if o['name'] in owners:
                raise ValidationError('Duplicate team member')
            owners.add(o['name'])
            number(o['weekly_capacity'], 'weekly_capacity', .01, 10000)
        if any(t['owner'] and t['owner'] not in owners for t in tasks):
            raise ValidationError('Task owner must be in team or blank')
        q = p['quality']
        for key in ('open_critical', 'open_high', 'total_tests', 'failed_tests'):
            number(q[key], key, 0, 100000)
            if int(q[key]) != q[key]:
                raise ValidationError('Quality counts must be integers')
        if q['failed_tests'] > q['total_tests']:
            raise ValidationError('Failed tests exceed total tests')
        decision_ids = set()
        for d in p['decisions']:
            for key in ('id', 'title', 'owner'):
                text(d[key], key)
            identifier(d['id'])
            if d['id'] in decision_ids:
                raise ValidationError('Duplicate decision ID')
            decision_ids.add(d['id'])
            day(d['due_date'])
            if d['status'] not in ('open', 'decided'):
                raise ValidationError('Invalid decision status')
    except (KeyError, TypeError) as e:
        raise ValidationError(f'Missing or invalid field: {e}') from None
    return p


def preserve_baseline(old, new):
    """Imports update actuals, never quietly rewrite the agreed baseline."""
    if old['baseline'] != new['baseline']:
        raise ValidationError('Baseline is locked. Use a new project ID for a separately approved baseline.')
    new_tasks = {t['id']: t for t in new['tasks']}
    old_ids = {t['id'] for t in old['tasks']}
    for t in old['tasks']:
        if t['baseline_points'] > 0:
            if t['id'] not in new_tasks or any(t[k] != new_tasks[t['id']][k] for k in ('baseline_start', 'baseline_due', 'baseline_points')):
                raise ValidationError('Baseline tasks cannot be removed or re-estimated silently')
    if any(t['id'] not in old_ids and t['baseline_points'] != 0 for t in new['tasks']):
        raise ValidationError('New scope must have baseline_points = 0')


def analyze(project, as_of):
    p = validate(project)
    today = day(as_of)
    tasks, b = p['tasks'], p['baseline']
    start, target = day(b['start_date']), day(b['target_date'])
    by_id = {t['id']: t for t in tasks}
    expected = 0.0
    for t in tasks:
        s, d = day(t['baseline_start']), day(t['baseline_due'])
        share = (1 if today >= d else 0) if d == s else min(1, max(0, (today-s).days/(d-s).days))
        expected += t['baseline_points'] * share
    expected = expected / b['scope_points'] * 100
    actual = sum(t['baseline_points']*t['progress']/100 for t in tasks)/b['scope_points']*100
    points = sum(t['points'] for t in tasks)
    completion = sum(t['points']*t['progress']/100 for t in tasks)/points*100
    scope_growth = (points/b['scope_points']-1)*100
    spend_pct = p['spent']/b['budget']*100
    gap = expected-actual
    alerts, trace = [], []
    def alert(code, key, severity, title, evidence, action, owner, task_ids=()):
        aid = f"{p['id']}:{code}:{key}"
        fingerprint = hashlib.sha256(json.dumps([severity,evidence], sort_keys=True).encode()).hexdigest()[:16]
        alerts.append(dict(id=aid, project_id=p['id'], code=code, severity=severity, title=title, evidence=evidence,
                           suggestion=action, owner=owner, task_ids=list(task_ids), fingerprint=fingerprint))
    def step(name, count, reason):
        trace.append(dict(tool=name, findings=count, reason=reason))
    n=len(alerts)
    if gap >= 10:
        alert('schedule','plan','critical' if gap>=25 else 'warning','Delivery is behind the original plan',
              f"Baseline progress {actual:.1f}% versus expected {expected:.1f}%: {gap:.1f} percentage points behind.",
              'Review unfinished baseline work with delivery leads; agree a recovery scope and publish the trade-off.',p['owner'])
    if today > target and completion < 100:
        alert('deadline','target','critical','Target date has passed',f"Target was {target}; current scope is {completion:.1f}% complete.",
              'Escalate the delivery decision and agree an explicit revised commitment.',p['owner'])
    for t in tasks:
        if t['status'] != 'done' and day(t['due_date']) < today:
            late=(today-day(t['due_date'])).days
            alert('overdue',t['id'],'critical' if late>=7 else 'warning',t['title']+' is overdue',
                  f"{late} days past current due date {t['due_date']}; progress {t['progress']}%.",
                  'Ask the owner for remaining work, the blocker and a recovery date.',t['owner'] or p['owner'],[t['id']])
        if day(t['due_date']) > day(t['baseline_due']):
            alert('slippage',t['id'],'warning','A commitment moved: '+t['title'],
                  f"Baseline due {t['baseline_due']}; current due {t['due_date']}.",
                  'Confirm downstream impact and record the reason for this date change.',t['owner'] or p['owner'],[t['id']])
    step('schedule_check',len(alerts)-n,'Compare dated, weighted baseline with reported actuals.')
    n=len(alerts)
    if abs(scope_growth) >= 10:
        alert('scope','points','warning','Scope changed after kickoff',
              f"Current scope {points:g} points; baseline {b['scope_points']:g} ({scope_growth:+.1f}%).",
              'Review the change with the sponsor; exchange scope or capacity before committing dates.',p['owner'])
    if p['spent'] > b['budget'] or (spend_pct - completion >= 20 and spend_pct >= 25):
        alert('budget','burn','critical' if p['spent']>b['budget'] else 'warning','Spend is outpacing delivery',
              f"Spent ${p['spent']:,.0f} of ${b['budget']:,.0f} ({spend_pct:.1f}%); current scope progress {completion:.1f}%.",
              'Review the cost-to-complete with finance and owners; distinguish upfront costs from persistent overruns.',p['owner'])
    step('scope_and_cost_check',len(alerts)-n,'Compare scope points and spend with approved baseline.')
    n=len(alerts)
    unfinished=[t for t in tasks if t['status']!='done']
    for t in unfinished:
        deps=[by_id[i] for i in t['depends_on'] if by_id[i]['status']!='done']
        at_risk=[d for d in deps if d['status']=='blocked' or day(d['due_date'])>=day(t['due_date']) or t['progress']>0]
        if t['status']=='blocked' or at_risk:
            titles=', '.join(d['title'] for d in at_risk)
            alert('dependency',t['id'],'warning','Blocked path: '+t['title'],
                  'Task reported blocked.'+(' Unfinished prerequisites: '+titles+'.' if titles else ''),
                  'Bring prerequisite owners together; unblock or resequence work and confirm the effect on the milestone.',t['owner'] or p['owner'],[t['id']]+[d['id'] for d in at_risk])
        if not t['owner']:
            alert('ownership',t['id'],'warning','Unowned work: '+t['title'],'No accountable owner is recorded.',
                  'Assign one accountable owner before work proceeds.',p['owner'],[t['id']])
    for owner in p['team']:
        due=[t for t in unfinished if t['owner']==owner['name'] and day(t['due_date'])<=today+timedelta(days=7)]
        load=sum(t['points']*(1-t['progress']/100) for t in due)
        if load > owner['weekly_capacity']:
            alert('capacity',owner['name'],'warning',owner['name']+' has too much near-term work',
                  f"{load:.1f} remaining points due within seven days (including overdue), capacity {owner['weekly_capacity']:g}.",
                  'Discuss reassignment or sequencing with the owner; check estimates before making a staffing decision.',owner['name'],[t['id'] for t in due])
    step('dependency_and_capacity_check',len(alerts)-n,'Inspect blocked work, prerequisite order and seven-day workload.')
    n=len(alerts)
    q=p['quality']
    if q['open_critical'] or q['open_high']>=5 or (q['total_tests'] and q['failed_tests']/q['total_tests']>.1):
        alert('quality','release','critical' if q['open_critical'] else 'warning','Quality needs a release decision',
              f"{q['open_critical']} critical defects, {q['open_high']} high defects; {q['failed_tests']}/{q['total_tests']} tests failing.",
              'Review defect impact with QA and engineering; define the release gate and recovery owner.',p['owner'])
    for d in p['decisions']:
        if d['status']=='open' and day(d['due_date'])<today:
            alert('decision',d['id'],'warning','Decision overdue: '+d['title'],
                  f"Decision owner {d['owner']}; needed by {d['due_date']}.",
                  'Give the decision maker options, a recommendation and the cost of waiting.',d['owner'])
    stale=[t for t in unfinished if (today-day(t['updated_at'])).days>7]
    future=[t for t in tasks if day(t['updated_at'])>today or (t.get('completed_at') and day(t['completed_at'])>today)]
    if stale:
        alert('data','stale','warning','Status evidence is stale',f"{len(stale)} unfinished tasks have no update for more than seven days.",
              'Request fresh status before treating forecasts as reliable.',p['owner'],[t['id'] for t in stale])
    if future:
        alert('data','future','warning','Records are newer than the review date',f"{len(future)} tasks contain updates or completions after {as_of}.",
              'Use the current review date. This tool does not reconstruct historical task states.',p['owner'],[t['id'] for t in future])
    step('quality_and_evidence_check',len(alerts)-n,'Inspect quality, decision latency and stale or future records.')
    alerts.sort(key=lambda a:(a['severity']!='critical',a['code'],a['id']))
    elapsed=max(0,(today-start).days)
    forecast=None
    if completion>=10 and elapsed>0 and completion<100:
        forecast=(start+timedelta(days=min(36500,math.ceil(elapsed/(completion/100))))).isoformat()
    metrics=dict(expected=round(expected,1),actual=round(actual,1),completion=round(completion,1),gap=round(gap,1),
                 scope_growth=round(scope_growth,1),scope_points=points,spent=p['spent'],budget=b['budget'],
                 forecast=forecast,forecast_method='Linear elapsed-time / reported current-scope completion; scenario estimate, not a commitment.',
                 data_confidence='Needs fresh data' if stale or future else 'Current task updates',
                 done=sum(t['status']=='done' for t in tasks),total=len(tasks))
    return dict(project_id=p['id'],as_of=as_of,health='Needs attention' if any(a['severity']=='critical' for a in alerts) else 'Watch' if alerts else 'On track',
                metrics=metrics,alerts=alerts,trace=trace)


def brief(report):
    """Deterministic fallback; each proposed action is linked to a detector's evidence."""
    return dict(source='Evidence rules',summary=f"{report['health']}: {len(report['alerts'])} active signals. Baseline delivery is {report['metrics']['actual']}% versus {report['metrics']['expected']}% expected.",
                actions=[dict(alert_id=a['id'],owner=a['owner'],action=a['suggestion']) for a in report['alerts'][:5]])
