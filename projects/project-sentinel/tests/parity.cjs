// Parity check: the browser demo engine must produce the same results as the Python app.
// Runs ~600 generated projects (valid and invalid), baseline-protection cases and an API
// lifecycle through both implementations. Usage: node tests/parity.cjs
'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');
const S = require('../static/sentinel-browser.js');

const root = path.resolve(__dirname, '..');
const SEED_DAY = '2026-09-29';
const { isoFromDays, day } = S._fmt;
const shift = (iso, n) => isoFromDays(day(iso) + n);
const clone = v => JSON.parse(JSON.stringify(v));

let seed = 20260929;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = xs => xs[Math.floor(rand() * xs.length)];
const chance = p => rand() < p;

function mutateValid(p) {
  const names = p.team.map(o => o.name);
  if (chance(0.3)) p.team.push({ name: pick(['Zoë', 'José', 'Ngozi O\'Neil', 'Lee "QA"']), weekly_capacity: 10 });
  for (const o of p.team) if (chance(0.5)) o.weekly_capacity = pick([int(1, 30), int(1, 60) / 2, 12.25, 0.75]);
  for (const t of p.tasks) {
    if (chance(0.6)) {
      const status = pick(['todo', 'in_progress', 'blocked', 'done']);
      t.status = status;
      t.progress = status === 'todo' ? 0 : status === 'done' ? 100 : pick([int(1, 99), int(1, 990) / 10, 33.35]);
      t.completed_at = status === 'done' ? shift(SEED_DAY, int(-20, 3)) : null;
      t.blocked_since = status === 'blocked' && chance(0.7) ? shift(SEED_DAY, int(-10, 0)) : null;
    }
    if (chance(0.4)) t.due_date = shift(t.baseline_due, int(-10, 15));
    if (chance(0.5)) t.updated_at = shift(SEED_DAY, int(-20, 5));
    if (chance(0.15)) t.owner = '';
    else if (chance(0.2)) t.owner = pick(p.team.map(o => o.name).concat(names));
    if (chance(0.3)) t.points = pick([int(1, 40), 7.5, 0.25]);
  }
  for (let i = 0; i < int(0, 3); i++) {
    const start = shift(SEED_DAY, int(-15, 10));
    p.tasks.push({ id: 'X' + i, title: pick(['Extra scope', 'Résumé import', 'Late ask 😀']), owner: pick(p.team.map(o => o.name).concat([''])), points: pick([int(1, 30), 12.5]),
      baseline_points: 0, baseline_start: start, baseline_due: shift(start, int(0, 12)), due_date: shift(start, int(0, 20)), progress: 0, status: 'todo',
      updated_at: shift(SEED_DAY, int(-12, 2)), completed_at: null, blocked_since: null, depends_on: chance(0.5) ? [p.tasks[int(0, p.tasks.length - 1)].id] : [] });
  }
  if (chance(0.6)) p.quality = { open_critical: int(0, 3), open_high: int(0, 9), total_tests: 0, failed_tests: 0 };
  if (chance(0.6)) { p.quality.total_tests = int(0, 200); p.quality.failed_tests = int(0, p.quality.total_tests); }
  if (chance(0.6)) p.spent = pick([int(0, 120000), int(0, 1000000) / 8, 80000.5, 1234567.5]);
  if (chance(0.5)) p.decisions.push({ id: 'D' + int(2, 9), title: 'Pricing call', owner: 'Sponsor', due_date: shift(SEED_DAY, int(-9, 9)), status: pick(['open', 'decided']) });
  return p;
}

const INVALID = [
  p => { p.tasks[0].due_date = '2026-02-30'; },
  p => { p.baseline.budget = 0; },
  p => { p.tasks[1].id = p.tasks[0].id; },
  p => { p.tasks[0].depends_on = [p.tasks[p.tasks.length - 1].id]; p.tasks[p.tasks.length - 1].depends_on = [p.tasks[0].id]; },
  p => { delete p.tasks[0].updated_at; },
  p => { delete p.baseline; },
  p => { p.tasks[1].status = 'done'; p.tasks[1].progress = 50; },
  p => { p.quality.failed_tests = p.quality.total_tests + 1; },
  p => { p.tasks[0].owner = 'Nobody'; },
  p => { p.tasks[0].baseline_points += 1; },
  p => { p.quality.open_high = 1.5; },
  p => { p.team = {}; },
  p => { p.id = 'atlas:quality'; },
  p => { p.tasks[0].depends_on = ['missing']; },
  p => { p.tasks[0].progress = true; },
  p => { p.decisions.push({ id: 'D9', title: 'x', owner: 'y', due_date: SEED_DAY, status: 'maybe' }); },
  p => { p.baseline.target_date = p.baseline.start_date; },
  p => { p.tasks = []; },
  p => { p.name = '   '; },
  p => { p.tasks[0].completed_at = null; p.tasks[0].status = 'done'; p.tasks[0].progress = 100; },
];

const samples = S.demoProjects(SEED_DAY);
const analyzeCases = [];
for (const p of samples) for (let off = -40; off <= 40; off += 4) analyzeCases.push({ project: clone(p), as_of: shift(SEED_DAY, off) });
for (let i = 0; i < 600; i++) {
  const p = mutateValid(clone(pick(samples)));
  if (chance(0.15)) pick(INVALID)(p);
  analyzeCases.push({ project: p, as_of: shift(SEED_DAY, int(-35, 35)) });
}
const preserveCases = [];
for (let i = 0; i < 60; i++) {
  const old = clone(pick(samples)), next = mutateValid(clone(old));
  const r = rand();
  if (r < 0.2) next.baseline.budget += 1;
  else if (r < 0.35) next.tasks = next.tasks.filter(t => t.id !== old.tasks[0].id);
  else if (r < 0.5) next.tasks[0].baseline_due = shift(next.tasks[0].baseline_due, 1);
  else if (r < 0.6 && next.tasks.some(t => t.id.startsWith('X'))) next.tasks.find(t => t.id.startsWith('X')).baseline_points = 3;
  preserveCases.push({ old, new: next });
}

const now = new Date(), today = isoFromDays(day([now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')));
const addTask = { id: 'new-scope', title: 'New request', owner: 'Jamie', points: 10, baseline_points: 0, baseline_start: today, baseline_due: shift(today, 10),
  due_date: shift(today, 10), progress: 0, status: 'todo', updated_at: today, completed_at: null, blocked_since: null, depends_on: [] };
const pulseCopy = Object.assign(S.demoProjects()[1], { id: 'copy', name: 'Copy' });
const lifecycle = [
  ['GET', '/api/state', ''],
  ['POST', '/api/acknowledge', { alert_id: 'atlas:quality:release' }],
  ['POST', '/api/acknowledge', { alert_id: 'atlas:budget:burn' }],
  ['POST', '/api/scan', {}],
  ['GET', '/api/history', 'atlas'],
  ['POST', '/api/task', { project_id: 'atlas', task_id: 'A2', changes: { status: 'done', progress: 100 } }],
  ['POST', '/api/status', { project_id: 'atlas', changes: { quality: { open_critical: 0, open_high: 0, total_tests: 120, failed_tests: 0 } } }],
  ['POST', '/api/status', { project_id: 'atlas', changes: { spent: 62000 } }],
  ['POST', '/api/status', { project_id: 'atlas', changes: { quality: { open_critical: 1, open_high: 0, total_tests: 120, failed_tests: 0 } } }],
  ['POST', '/api/add-task', { project_id: 'pulse', task: addTask }],
  ['POST', '/api/task', { project_id: 'pulse', task_id: 'P2', changes: { status: 'blocked', progress: 50, owner: '' } }],
  ['POST', '/api/date', { as_of: shift(today, 10) }],
  ['POST', '/api/date', { as_of: '2026-13-01' }],
  ['POST', '/api/date', { as_of: null }],
  ['POST', '/api/import', { project: { id: 'bad' } }],
  ['POST', '/api/import', { project: pulseCopy }],
  ['POST', '/api/import', { project: Object.assign(clone(pulseCopy), { baseline: Object.assign(clone(pulseCopy.baseline), { budget: 1 }) }) }],
  ['POST', '/api/delete-project', { project_id: 'copy' }],
  ['POST', '/api/delete-project', { project_id: 'nope' }],
  ['POST', '/api/brief', { project_id: 'atlas' }],
  ['POST', '/api/unknown', {}],
  ['POST', '/api/task', {}],
  ['POST', '/api/task', { project_id: 'atlas', task_id: 'A3', changes: { title: 'Renamed' } }],
  ['POST', '/api/acknowledge', { alert_id: 'atlas:schedule:plan' }],
  ['POST', '/api/acknowledge', { alert_id: 'atlas:schedule:plan' }],
  ['POST', '/api/acknowledge', { alert_id: 'atlas:quality:release-resolved?' }],
  ['GET', '/api/history', 'pulse'],
  ['GET', '/api/state', ''],
];

const run = spawnSync(process.env.PYTHON || 'python3', [path.join(__dirname, 'parity_oracle.py')], {
  input: JSON.stringify({ seed_day: SEED_DAY, analyze: analyzeCases, preserve: preserveCases, lifecycle }), cwd: root, maxBuffer: 1 << 28, encoding: 'utf8' });
if (run.status !== 0) { console.error(run.stderr); process.exit(1); }
const py = JSON.parse(run.stdout);

function outcome(fn) {
  try { return { ok: fn() }; } catch (e) { return e instanceof S.ValidationError ? { error: e.message } : { error: 'unexpected: ' + e.name }; }
}
const loose = m => /^(Missing or invalid field|Invalid ISO date|unexpected)/.test(m);
function same(a, b, label) {
  if ('error' in a || 'error' in b) {
    assert.ok('error' in a && 'error' in b, `${label}: one implementation rejected the input (${a.error || b.error})`);
    if (!loose(a.error) && !loose(b.error)) assert.equal(a.error, b.error, label);
  } else assert.deepStrictEqual(clone(a.ok), clone(b.ok), label);
}

assert.deepStrictEqual(clone(samples), py.samples, 'sample projects');
for (const p of samples) assert.deepStrictEqual(clone(S.demoHistory(p, SEED_DAY)), py.history[p.id], 'history checkpoints for ' + p.id);
let valid = 0, invalid = 0;
analyzeCases.forEach((c, i) => {
  const js = outcome(() => S.analyze(clone(c.project), c.as_of));
  same(js, py.analyze[i], `analyze case ${i}`);
  if ('ok' in js) valid += 1; else invalid += 1;
});
preserveCases.forEach((c, i) => same(outcome(() => S.preserveBaseline(c.old, c.new) || true), py.preserve[i], `preserve case ${i}`));

const STAMPS = new Set(['first_seen', 'last_seen', 'acknowledged_at', 'scanned_at', 'last_scan']);
const normalize = v => Array.isArray(v) ? v.map(normalize) : v && typeof v === 'object'
  ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'monitor').map(([k, x]) => [k, STAMPS.has(k) ? x !== null : normalize(x)])) : v;
const api = new S.Api(new S.Store({}), { mode: 'parity' });
lifecycle.forEach(([method, route, data], i) => {
  const js = method === 'GET' ? api.get(route, new URLSearchParams({ project: data })) : api.post(route, clone(data));
  assert.equal(js[0], py.lifecycle[i][0], `lifecycle step ${i} ${route} status`);
  assert.deepStrictEqual(normalize(clone(js[1])), normalize(py.lifecycle[i][1]), `lifecycle step ${i} ${route} body`);
});
const ack = py.lifecycle[lifecycle.length - 1][1].alerts.filter(a => a.state === 'acknowledged').length;
console.log(`PASS ${valid} valid and ${invalid} invalid projects, ${preserveCases.length} baseline-protection cases and ${lifecycle.length} API lifecycle steps match the Python app (${ack} alerts acknowledged at the end).`);
