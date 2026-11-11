/* Project Sentinel — in-browser engine for the no-install demo.
 *
 * A line-by-line port of engine.py, samples.py, store.py and api.py so the same
 * dashboard (static/app.js) can run on GitHub Pages or from a downloaded folder.
 * The Python app remains the reference implementation: tests/parity.cjs runs both
 * engines on the same projects and requires identical reports, alerts and fingerprints.
 */
(function (root) {
  'use strict';

  class ValidationError extends Error {}
  class KeyErr extends Error {}

  // ---------- Python-compatible helpers ----------
  const PY_WS = new Set([...' \t\n\v\f\r\x1c\x1d\x1e\x1f\x85\xa0                　']);
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const has = (o, k) => isObj(o) && Object.prototype.hasOwnProperty.call(o, k);
  function req(o, k) { if (!has(o, k)) throw new KeyErr(k); return o[k]; }
  function truthy(v) {
    if (Array.isArray(v)) return v.length > 0;
    if (isObj(v)) return Object.keys(v).length > 0;
    return Boolean(v);
  }
  function pyEq(a, b) {
    const num = v => typeof v === 'number' || typeof v === 'boolean';
    if (num(a) && num(b)) return Number(a) === Number(b);
    if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => pyEq(x, b[i]));
    if (isObj(a) || isObj(b)) {
      if (!isObj(a) || !isObj(b)) return false;
      const ka = Object.keys(a), kb = Object.keys(b);
      return ka.length === kb.length && ka.every(k => has(b, k) && pyEq(a[k], b[k]));
    }
    return a === b;
  }
  function cmpStr(a, b) { // Python/SQLite ordering: by Unicode code point
    const x = Array.from(a), y = Array.from(b);
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      const d = x[i].codePointAt(0) - y[i].codePointAt(0);
      if (d) return d;
    }
    return x.length - y.length;
  }
  const clone = v => JSON.parse(JSON.stringify(v));

  // Exact decimal formatting with round-half-even, matching Python's format() and round().
  function exactParts(x) {
    if (x === 0) return { n: 0n, s: 0 };
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, x);
    const hi = view.getUint32(0), lo = view.getUint32(4), exp = (hi >>> 20) & 0x7ff;
    let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo), e;
    if (exp === 0) e = -1074; else { mant |= 1n << 52n; e = exp - 1075; }
    if (e >= 0) return { n: mant << BigInt(e), s: 0 };
    return { n: mant * 5n ** BigInt(-e), s: -e };
  }
  function roundScaled(x, k) { // integer q with |x| ≈ q / 10^k, ties to even
    const { n, s } = exactParts(Math.abs(x));
    if (s <= k) return n * 10n ** BigInt(k - s);
    const div = 10n ** BigInt(s - k);
    let q = n / div;
    const twice = 2n * (n % div);
    if (twice > div || (twice === div && (q & 1n) === 1n)) q += 1n;
    return q;
  }
  const negative = x => x < 0 || Object.is(x, -0);
  function pyFixed(x, k, sign = false) {
    let str = roundScaled(x, k).toString();
    if (k > 0) { str = str.padStart(k + 1, '0'); str = str.slice(0, -k) + '.' + str.slice(-k); }
    return (negative(x) ? '-' : sign ? '+' : '') + str;
  }
  const pyRound = (x, k) => Number(pyFixed(x, k));
  function pyComma0(x) {
    const s = pyFixed(Math.abs(x), 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (negative(x) ? '-' : '') + s;
  }
  function pyG(x) { // format(x, 'g'): six significant digits
    if (x === 0) return negative(x) ? '-0' : '0';
    const ax = Math.abs(x), { n, s } = exactParts(ax);
    let e = n.toString().length - 1 - s;
    if (roundScaled(ax, 5 - e).toString().length > 6) e += 1;
    let out;
    if (e >= -4 && e < 6) {
      out = pyFixed(ax, 5 - e);
      if (out.includes('.')) out = out.replace(/0+$/, '').replace(/\.$/, '');
    } else {
      let digits = roundScaled(ax, 5 - e).toString().slice(0, 6);
      let mant = digits[0] + (digits.length > 1 ? '.' + digits.slice(1) : '');
      if (mant.includes('.')) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
      out = mant + 'e' + (e < 0 ? '-' : '+') + String(Math.abs(e)).padStart(2, '0');
    }
    return (x < 0 ? '-' : '') + out;
  }
  const pyStr = v => String(v); // str() of a JSON integer or non-integral float
  const pyFloat = v => (Number.isInteger(v) && Math.abs(v) < 1e16 ? v.toFixed(1) : String(v)); // str() of a Python float

  // json.dumps(value) with Python's default ensure_ascii and separators.
  function pyJson(v) {
    if (typeof v === 'string') {
      let out = '"';
      for (const ch of v) {
        const c = ch.codePointAt(0);
        if (ch === '"') out += '\\"';
        else if (ch === '\\') out += '\\\\';
        else if (ch === '\n') out += '\\n';
        else if (ch === '\r') out += '\\r';
        else if (ch === '\t') out += '\\t';
        else if (ch === '\b') out += '\\b';
        else if (ch === '\f') out += '\\f';
        else if (c >= 0x20 && c <= 0x7e) out += ch;
        else for (let i = 0; i < ch.length; i++) out += '\\u' + ch.charCodeAt(i).toString(16).padStart(4, '0');
      }
      return out + '"';
    }
    if (Array.isArray(v)) return '[' + v.map(pyJson).join(', ') + ']';
    throw new TypeError('pyJson supports strings and lists only');
  }

  // Compact synchronous SHA-256 for stable alert fingerprints.
  const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  function sha256hex(ascii) {
    const bytes = Array.from(ascii, c => c.charCodeAt(0) & 0xff), bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
    const h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
    const w = new Uint32Array(64), rot = (x, n) => (x >>> n) | (x << (32 - n));
    for (let off = 0; off < bytes.length; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = (bytes[off + 4 * i] << 24) | (bytes[off + 4 * i + 1] << 16) | (bytes[off + 4 * i + 2] << 8) | bytes[off + 4 * i + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = rot(w[i - 15], 7) ^ rot(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rot(w[i - 2], 17) ^ rot(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = w[i - 16] + s0 + w[i - 7] + s1;
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
        const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }
    return Array.from(h, x => x.toString(16).padStart(8, '0')).join('');
  }

  // ---------- Dates as integer day numbers (proleptic Gregorian, like Python's date) ----------
  function daysFromCivil(y, m, d) {
    y -= m <= 2 ? 1 : 0;
    const era = Math.floor(y / 400), yoe = y - era * 400;
    const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
    return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468;
  }
  function isoFromDays(z) {
    z += 719468;
    const era = Math.floor(z / 146097), doe = z - era * 146097;
    const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)), mp = Math.floor((5 * doy + 2) / 153);
    const d = doy - Math.floor((153 * mp + 2) / 5) + 1, m = mp + (mp < 10 ? 3 : -9), y = yoe + era * 400 + (m <= 2 ? 1 : 0);
    if (y < 1 || y > 9999) throw new RangeError('date value out of range');
    return String(y).padStart(4, '0') + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }
  function day(value) {
    const m = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3];
      const dim = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (y >= 1 && mo >= 1 && mo <= 12 && d >= 1 && d <= dim[mo - 1]) return daysFromCivil(y, mo, d);
    }
    throw new ValidationError('Invalid ISO date: ' + (typeof value === 'string' ? "'" + value + "'" : String(value)));
  }
  function localToday(offset = 0) {
    const n = new Date();
    return isoFromDays(daysFromCivil(n.getFullYear(), n.getMonth() + 1, n.getDate()) + offset);
  }

  // ---------- engine.py ----------
  function number(value, name, low = 0, high = 1e9) {
    if (typeof value !== 'number' || !Number.isFinite(value) || !(low <= value && value <= high))
      throw new ValidationError(`${name} must be a finite number from ${pyStr(low)} to ${pyStr(high === 1e9 ? 1000000000 : high)}`);
  }
  function text(value, name, empty = false) {
    if (typeof value !== 'string' || (!empty && Array.from(value).every(c => PY_WS.has(c))) || Array.from(value).length > 2000)
      throw new ValidationError('Invalid ' + name);
  }
  function identifier(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(value))
      throw new ValidationError('IDs must use 1–100 letters, digits, underscores or hyphens');
  }

  function validate(p) {
    try {
      for (const key of ['id', 'name', 'owner', 'objective']) text(req(p, key), key);
      identifier(p.id);
      const b = req(p, 'baseline');
      if (!isObj(b) || !isObj(req(p, 'quality'))) throw new ValidationError('baseline and quality must be objects');
      if (!Array.isArray(req(p, 'team')) || !Array.isArray(req(p, 'decisions'))) throw new ValidationError('team and decisions must be lists');
      if (day(req(b, 'target_date')) <= day(req(b, 'start_date'))) throw new ValidationError('Target must follow start date');
      number(req(b, 'budget'), 'budget', 1);
      number(req(b, 'scope_points'), 'baseline scope', 1);
      number(req(p, 'spent'), 'spent');
      const tasks = req(p, 'tasks');
      if (!Array.isArray(tasks) || !(tasks.length >= 1 && tasks.length <= 500)) throw new ValidationError('Provide 1–500 tasks');
      const ids = new Set();
      for (const t of tasks) {
        for (const key of ['id', 'title']) text(req(t, key), key);
        identifier(t.id);
        text(req(t, 'owner'), 'task owner', true);
        if (ids.has(t.id)) throw new ValidationError('Duplicate task ID');
        ids.add(t.id);
        number(req(t, 'points'), 'points', 0.01, 10000);
        number(req(t, 'baseline_points'), 'baseline_points', 0, 10000);
        number(req(t, 'progress'), 'progress', 0, 100);
        if (!['todo', 'in_progress', 'blocked', 'done'].includes(req(t, 'status'))) throw new ValidationError('Invalid task status');
        if ((t.status === 'done') !== (t.progress === 100) || (t.status === 'todo' && t.progress !== 0)) throw new ValidationError('Done requires 100%; todo requires 0%');
        if (day(req(t, 'baseline_due')) < day(req(t, 'baseline_start'))) throw new ValidationError('Task baseline due precedes start');
        for (const key of ['due_date', 'updated_at']) day(req(t, key));
        if (truthy(t.completed_at)) day(t.completed_at);
        if (t.status === 'done' && !truthy(t.completed_at)) throw new ValidationError('Completed task needs completed_at');
        if (t.status !== 'done' && truthy(t.completed_at)) throw new ValidationError('Incomplete task cannot have completed_at');
        if (truthy(t.blocked_since)) day(t.blocked_since);
        const deps = req(t, 'depends_on');
        if (!Array.isArray(deps) || deps.length !== new Set(deps).size) throw new ValidationError('Invalid dependency list');
      }
      let sum = 0;
      for (const t of tasks) sum += t.baseline_points;
      if (Math.abs(sum - b.scope_points) > 0.001) throw new ValidationError('Baseline task points must sum to baseline scope_points');
      const graph = new Map(tasks.map(t => [t.id, t.depends_on])), seen = new Set(), active = new Set();
      const visit = i => {
        if (!graph.has(i)) throw new ValidationError('Missing dependency: ' + String(i));
        if (active.has(i)) throw new ValidationError('Dependency cycle');
        if (seen.has(i)) return;
        active.add(i);
        for (const dep of graph.get(i)) visit(dep);
        active.delete(i);
        seen.add(i);
      };
      for (const i of graph.keys()) visit(i);
      const owners = new Set();
      for (const o of p.team) {
        text(req(o, 'name'), 'team member');
        if (owners.has(o.name)) throw new ValidationError('Duplicate team member');
        owners.add(o.name);
        number(req(o, 'weekly_capacity'), 'weekly_capacity', 0.01, 10000);
      }
      if (tasks.some(t => truthy(t.owner) && !owners.has(t.owner))) throw new ValidationError('Task owner must be in team or blank');
      const q = p.quality;
      for (const key of ['open_critical', 'open_high', 'total_tests', 'failed_tests']) {
        number(req(q, key), key, 0, 100000);
        if (!Number.isInteger(q[key])) throw new ValidationError('Quality counts must be integers');
      }
      if (q.failed_tests > q.total_tests) throw new ValidationError('Failed tests exceed total tests');
      const decisionIds = new Set();
      for (const d of p.decisions) {
        for (const key of ['id', 'title', 'owner']) text(req(d, key), key);
        identifier(d.id);
        if (decisionIds.has(d.id)) throw new ValidationError('Duplicate decision ID');
        decisionIds.add(d.id);
        day(req(d, 'due_date'));
        if (!['open', 'decided'].includes(req(d, 'status'))) throw new ValidationError('Invalid decision status');
      }
    } catch (e) {
      if (e instanceof KeyErr) throw new ValidationError(`Missing or invalid field: '${e.message}'`);
      if (e instanceof TypeError) throw new ValidationError('Missing or invalid field: ' + e.message);
      throw e;
    }
    return p;
  }

  function preserveBaseline(old, next) {
    if (!pyEq(old.baseline, next.baseline)) throw new ValidationError('Baseline is locked. Use a new project ID for a separately approved baseline.');
    const nextTasks = new Map(next.tasks.map(t => [t.id, t])), oldIds = new Set(old.tasks.map(t => t.id));
    for (const t of old.tasks) {
      if (t.baseline_points > 0) {
        const n = nextTasks.get(t.id);
        if (!n || ['baseline_start', 'baseline_due', 'baseline_points'].some(k => !pyEq(t[k], n[k])))
          throw new ValidationError('Baseline tasks cannot be removed or re-estimated silently');
      }
    }
    if (next.tasks.some(t => !oldIds.has(t.id) && t.baseline_points !== 0)) throw new ValidationError('New scope must have baseline_points = 0');
  }

  function expectedAt(tasks, scopePoints, when) {
    let expected = 0;
    for (const t of tasks) {
      const s = day(t.baseline_start), d = day(t.baseline_due);
      const share = d === s ? (when >= d ? 1 : 0) : Math.min(1, Math.max(0, (when - s) / (d - s)));
      expected += t.baseline_points * share;
    }
    return expected / scopePoints * 100;
  }

  function planCurve(tasks, baseline) {
    const dates = new Set([day(baseline.start_date), day(baseline.target_date)]);
    for (const t of tasks) {
      if (t.baseline_points > 0) {
        const s = day(t.baseline_start), d = day(t.baseline_due);
        dates.add(s); dates.add(d);
        if (s === d) dates.add(d - 1);
      }
    }
    return [...dates].sort((a, b) => a - b).map(x => ({ date: isoFromDays(x), expected: pyRound(expectedAt(tasks, baseline.scope_points, x), 1) }));
  }

  function analyze(project, asOf) {
    const p = validate(project), today = day(asOf), tasks = p.tasks, b = p.baseline;
    const start = day(b.start_date), target = day(b.target_date);
    const byId = new Map(tasks.map(t => [t.id, t]));
    const expected = expectedAt(tasks, b.scope_points, today);
    let actual = 0, points = 0, done = 0;
    for (const t of tasks) actual += t.baseline_points * t.progress / 100;
    actual = actual / b.scope_points * 100;
    for (const t of tasks) points += t.points;
    let completion = 0;
    for (const t of tasks) completion += t.points * t.progress / 100;
    completion = completion / points * 100;
    const scopeGrowth = (points / b.scope_points - 1) * 100, spendPct = p.spent / b.budget * 100, gap = expected - actual;
    const alerts = [], trace = [];
    const alert = (code, key, severity, title, evidence, suggestion, owner, taskIds = []) => {
      const fingerprint = sha256hex(pyJson([severity, evidence])).slice(0, 16);
      alerts.push({ id: `${p.id}:${code}:${key}`, project_id: p.id, code, severity, title, evidence, suggestion, owner, task_ids: [...taskIds], fingerprint });
    };
    const step = (tool, findings, reason) => trace.push({ tool, findings, reason });
    let n = alerts.length;
    if (gap >= 10)
      alert('schedule', 'plan', gap >= 25 ? 'critical' : 'warning', 'Delivery is behind the original plan',
        `Baseline progress ${pyFixed(actual, 1)}% versus expected ${pyFixed(expected, 1)}%: ${pyFixed(gap, 1)} percentage points behind.`,
        'Review unfinished baseline work with delivery leads; agree a recovery scope and publish the trade-off.', p.owner);
    if (today > target && completion < 100)
      alert('deadline', 'target', 'critical', 'Target date has passed', `Target was ${b.target_date}; current scope is ${pyFixed(completion, 1)}% complete.`,
        'Escalate the delivery decision and agree an explicit revised commitment.', p.owner);
    for (const t of tasks) {
      if (t.status !== 'done' && day(t.due_date) < today) {
        const late = today - day(t.due_date);
        alert('overdue', t.id, late >= 7 ? 'critical' : 'warning', t.title + ' is overdue',
          `${late} days past current due date ${t.due_date}; progress ${pyStr(t.progress)}%.`,
          'Ask the owner for remaining work, the blocker and a recovery date.', truthy(t.owner) ? t.owner : p.owner, [t.id]);
      }
      if (day(t.due_date) > day(t.baseline_due))
        alert('slippage', t.id, 'warning', 'A commitment moved: ' + t.title, `Baseline due ${t.baseline_due}; current due ${t.due_date}.`,
          'Confirm downstream impact and record the reason for this date change.', truthy(t.owner) ? t.owner : p.owner, [t.id]);
    }
    step('schedule_check', alerts.length - n, 'Compare dated, weighted baseline with reported actuals.');
    n = alerts.length;
    if (Math.abs(scopeGrowth) >= 10)
      alert('scope', 'points', 'warning', 'Scope changed after kickoff',
        `Current scope ${pyG(points)} points; baseline ${pyG(b.scope_points)} (${pyFixed(scopeGrowth, 1, true)}%).`,
        'Review the change with the sponsor; exchange scope or capacity before committing dates.', p.owner);
    if (p.spent > b.budget || (spendPct - completion >= 20 && spendPct >= 25))
      alert('budget', 'burn', p.spent > b.budget ? 'critical' : 'warning', 'Spend is outpacing delivery',
        `Spent $${pyComma0(p.spent)} of $${pyComma0(b.budget)} (${pyFixed(spendPct, 1)}%); current scope progress ${pyFixed(completion, 1)}%.`,
        'Review the cost-to-complete with finance and owners; distinguish upfront costs from persistent overruns.', p.owner);
    step('scope_and_cost_check', alerts.length - n, 'Compare scope points and spend with approved baseline.');
    n = alerts.length;
    const unfinished = tasks.filter(t => t.status !== 'done');
    for (const t of unfinished) {
      const deps = t.depends_on.map(i => byId.get(i)).filter(d => d.status !== 'done');
      const atRisk = deps.filter(d => d.status === 'blocked' || day(d.due_date) >= day(t.due_date) || t.progress > 0);
      if (t.status === 'blocked' || atRisk.length) {
        const blocked = t.status === 'blocked';
        const reasons = atRisk.map(d => d.title + (d.status === 'blocked' ? ' (blocked)' : day(d.due_date) >= day(t.due_date)
          ? ` (due ${d.due_date}, not before this task)` : ' (unfinished; this task has already started)')).join('; ');
        const evidence = [blocked ? 'Task reported blocked.' : '', reasons ? 'Unfinished prerequisites: ' + reasons + '.' : ''].filter(Boolean).join(' ');
        alert('dependency', t.id, 'warning', (blocked ? 'Blocked path: ' : 'Dependency risk: ') + t.title, evidence,
          'Bring prerequisite owners together; unblock or resequence work and confirm the effect on the milestone.',
          truthy(t.owner) ? t.owner : p.owner, [t.id, ...atRisk.map(d => d.id)]);
      }
      if (!truthy(t.owner))
        alert('ownership', t.id, 'warning', 'Unowned work: ' + t.title, 'No accountable owner is recorded.', 'Assign one accountable owner before work proceeds.', p.owner, [t.id]);
    }
    for (const owner of p.team) {
      const due = unfinished.filter(t => t.owner === owner.name && day(t.due_date) <= today + 7);
      let load = 0;
      for (const t of due) load += t.points * (1 - t.progress / 100);
      if (load > owner.weekly_capacity)
        alert('capacity', owner.name, 'warning', owner.name + ' has too much near-term work',
          `${pyFixed(load, 1)} remaining points due within seven days (including overdue), capacity ${pyG(owner.weekly_capacity)}.`,
          'Discuss reassignment or sequencing with the owner; check estimates before making a staffing decision.', owner.name, due.map(t => t.id));
    }
    step('dependency_and_capacity_check', alerts.length - n, 'Inspect blocked work, prerequisite order and seven-day workload.');
    n = alerts.length;
    const q = p.quality;
    if (q.open_critical || q.open_high >= 5 || (q.total_tests && q.failed_tests / q.total_tests > 0.1))
      alert('quality', 'release', q.open_critical ? 'critical' : 'warning', 'Quality needs a release decision',
        `${pyStr(q.open_critical)} critical defects, ${pyStr(q.open_high)} high defects; ${pyStr(q.failed_tests)}/${pyStr(q.total_tests)} tests failing.`,
        'Review defect impact with QA and engineering; define the release gate and recovery owner.', p.owner);
    for (const d of p.decisions)
      if (d.status === 'open' && day(d.due_date) < today)
        alert('decision', d.id, 'warning', 'Decision overdue: ' + d.title, `Decision owner ${d.owner}; needed by ${d.due_date}.`,
          'Give the decision maker options, a recommendation and the cost of waiting.', d.owner);
    const stale = unfinished.filter(t => today - day(t.updated_at) > 7);
    const future = tasks.filter(t => day(t.updated_at) > today || (truthy(t.completed_at) && day(t.completed_at) > today));
    if (stale.length)
      alert('data', 'stale', 'warning', 'Status evidence is stale', `${stale.length} unfinished tasks have no update for more than seven days.`,
        'Request fresh status before treating forecasts as reliable.', p.owner, stale.map(t => t.id));
    if (future.length)
      alert('data', 'future', 'warning', 'Records are newer than the review date', `${future.length} tasks contain updates or completions after ${asOf}.`,
        'Use the current review date. This tool does not reconstruct historical task states.', p.owner, future.map(t => t.id));
    step('quality_and_evidence_check', alerts.length - n, 'Inspect quality, decision latency and stale or future records.');
    alerts.sort((a, b) => ((a.severity !== 'critical') - (b.severity !== 'critical')) || cmpStr(a.code, b.code) || cmpStr(a.id, b.id));
    const elapsed = Math.max(0, today - start);
    let forecast = null;
    if (completion >= 10 && elapsed > 0 && completion < 100) forecast = isoFromDays(start + Math.min(36500, Math.ceil(elapsed / (completion / 100))));
    for (const t of tasks) if (t.status === 'done') done += 1;
    const metrics = {
      expected: pyRound(expected, 1), actual: pyRound(actual, 1), completion: pyRound(completion, 1), gap: pyRound(gap, 1),
      scope_growth: pyRound(scopeGrowth, 1), scope_points: points, spent: p.spent, budget: b.budget, forecast,
      forecast_method: 'Linear elapsed-time / reported current-scope completion; scenario estimate, not a commitment.',
      data_confidence: stale.length || future.length ? 'Needs fresh data' : 'Current task updates', done, total: tasks.length,
    };
    const health = alerts.some(a => a.severity === 'critical') ? 'Needs attention' : alerts.length ? 'Watch' : 'On track';
    return { project_id: p.id, as_of: asOf, health, metrics, alerts, trace, plan: planCurve(tasks, b) };
  }

  function brief(report) {
    return {
      source: 'Evidence rules',
      summary: `${report.health}: ${report.alerts.length} active signals. Baseline delivery is ${pyFloat(report.metrics.actual)}% versus ${pyFloat(report.metrics.expected)}% expected.`,
      actions: report.alerts.slice(0, 5).map(a => ({ alert_id: a.id, owner: a.owner, action: a.suggestion })),
    };
  }

  // ---------- samples.py ----------
  function demoProjects(todayIso) {
    const base = todayIso ? day(todayIso) : day(localToday());
    const d = offset => isoFromDays(base + offset);
    const task = (id, title, owner, points, start, due, progress, status, { updated = -1, deps = [], currentDue = null, baseline = null } = {}) => ({
      id, title, owner, points, baseline_points: baseline === null ? points : baseline, baseline_start: d(start), baseline_due: d(due),
      due_date: d(currentDue === null ? due : currentDue), progress, status, updated_at: d(updated), depends_on: [...deps],
      completed_at: status === 'done' ? d(updated) : null, blocked_since: status === 'blocked' ? d(-5) : null,
    });
    const risk = {
      id: 'atlas', name: 'Atlas Partner API', owner: 'Morgan · PM', objective: 'Launch partner self-service onboarding with reliable API access.',
      baseline: { start_date: d(-28), target_date: d(14), budget: 80000, scope_points: 100 }, spent: 61000,
      team: [{ name: 'Alex', weekly_capacity: 15 }, { name: 'Sam', weekly_capacity: 18 }, { name: 'Riley', weekly_capacity: 12 }],
      quality: { open_critical: 2, open_high: 6, total_tests: 120, failed_tests: 19 },
      decisions: [{ id: 'D1', title: 'Partner authentication approach', owner: 'Platform lead', due_date: d(-3), status: 'open' }],
      tasks: [task('A1', 'Discovery and acceptance criteria', 'Alex', 10, -28, -22, 100, 'done', { updated: -22 }),
        task('A2', 'Authentication contract', 'Alex', 20, -21, -6, 60, 'blocked', { updated: -9 }),
        task('A3', 'Partner sandbox', 'Alex', 20, -16, -1, 35, 'in_progress', { deps: ['A2'] }),
        task('A4', 'Self-service setup', 'Sam', 20, -10, 5, 25, 'in_progress', { deps: ['A3'] }),
        task('A5', 'Contract and regression tests', 'Riley', 15, -7, 9, 10, 'in_progress', { deps: ['A3'] }),
        task('A6', 'Pilot and operational handoff', 'Sam', 15, 5, 14, 0, 'todo', { deps: ['A4', 'A5'] }),
        task('A7', 'Added bulk-import requirement', 'Alex', 25, -4, 4, 0, 'todo', { baseline: 0 })],
    };
    const healthy = {
      id: 'pulse', name: 'Pulse Analytics Refresh', owner: 'Taylor · PM', objective: 'Make activation metrics consistent across customer teams.',
      baseline: { start_date: d(-20), target_date: d(20), budget: 50000, scope_points: 40 }, spent: 18000,
      team: [{ name: 'Jamie', weekly_capacity: 15 }, { name: 'Casey', weekly_capacity: 20 }],
      quality: { open_critical: 0, open_high: 1, total_tests: 60, failed_tests: 1 }, decisions: [],
      tasks: [task('P1', 'Agree event definitions', 'Jamie', 10, -20, -10, 100, 'done', { updated: -10 }),
        task('P2', 'Build activation model', 'Casey', 20, -10, 10, 50, 'in_progress'),
        task('P3', 'Publish dashboard and guide', 'Jamie', 10, 10, 20, 0, 'todo', { deps: ['P2'] })],
    };
    return [risk, healthy];
  }

  const CHECKPOINTS = {
    atlas: [[-21, 18000, [0, 1, 40, 0], { A1: 100, A2: 5 }],
      [-14, 32000, [0, 3, 80, 4], { A1: 100, A2: 30, A3: 5 }],
      [-7, 47000, [1, 5, 100, 12], { A1: 100, A2: 55, A3: 20, A4: 10 }]],
    pulse: [[-14, 7000, [0, 0, 20, 0], { P1: 60 }],
      [-7, 12000, [0, 1, 40, 1], { P1: 100, P2: 15 }]],
  };
  function demoHistory(project, todayIso) {
    const base = todayIso ? day(todayIso) : day(localToday());
    return (CHECKPOINTS[project.id] || []).map(([offset, spent, quality, progress]) => {
      const asOf = isoFromDays(base + offset), snap = clone(project);
      snap.spent = spent;
      snap.quality = { open_critical: quality[0], open_high: quality[1], total_tests: quality[2], failed_tests: quality[3] };
      snap.tasks = snap.tasks.filter(t => t.baseline_points > 0 || t.baseline_start <= asOf);
      for (const t of snap.tasks) {
        const pct = progress[t.id] || 0;
        Object.assign(t, { progress: pct, status: pct === 100 ? 'done' : pct === 0 ? 'todo' : 'in_progress', due_date: t.baseline_due, blocked_since: null,
          completed_at: pct === 100 ? t.completed_at : null, updated_at: pct === 100 ? t.completed_at : asOf });
      }
      return [asOf, snap];
    });
  }

  // ---------- store.py (in-memory; optional persistence callback) ----------
  const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
  function sortedJson(v) {
    if (Array.isArray(v)) return '[' + v.map(sortedJson).join(',') + ']';
    if (isObj(v)) return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + sortedJson(v[k])).join(',') + '}';
    return JSON.stringify(v);
  }
  const compact = (scannedAt, r) => ({ scanned_at: scannedAt, as_of: r.as_of, health: r.health, metrics: r.metrics });

  class Store {
    constructor({ data = null, save = null, now = nowIso, today = localToday, historyLimit = 100, seedDay = null } = {}) {
      this.save = save; this.now = now; this.today = today; this.historyLimit = historyLimit;
      this.db = data || { projects: {}, alerts: {}, history: [], settings: {}, seq: 0 };
      if (!Object.keys(this.db.projects).length) {
        for (const p of demoProjects(seedDay)) {
          validate(p);
          this.db.projects[p.id] = JSON.stringify(p);
          for (const [asOf, snap] of demoHistory(p, seedDay))
            this.db.history.push({ id: ++this.db.seq, project_id: p.id, scanned_at: asOf + 'T12:00:00+00:00', body: sortedJson(analyze(snap, asOf)) });
        }
      }
      this.scan();
    }
    transact(fn) {
      const before = JSON.stringify(this.db);
      try { const result = fn(); if (this.save) this.save(this.db); return result; }
      catch (e) { this.db = JSON.parse(before); throw e; }
    }
    projects() { return Object.keys(this.db.projects).sort(cmpStr).map(id => JSON.parse(this.db.projects[id])); }
    asOf() { return this.db.settings.as_of || this.today(); }
    scan() { return this.transact(() => this._scan()); }
    _scan() {
      const now = this.now(), asOf = this.asOf();
      for (const p of this.projects()) {
        const result = analyze(p, asOf), active = new Set();
        for (const a of result.alerts) {
          active.add(a.id);
          const old = this.db.alerts[a.id];
          let state = 'open', acknowledged = null;
          if (old && old.state === 'acknowledged' && JSON.parse(old.body).fingerprint === a.fingerprint) { state = 'acknowledged'; acknowledged = old.acknowledged_at; }
          const first = old && old.state !== 'resolved' ? old.first_seen : now;
          this.db.alerts[a.id] = { project_id: p.id, body: JSON.stringify(a), state, first_seen: first, last_seen: now, acknowledged_at: acknowledged };
        }
        for (const [aid, row] of Object.entries(this.db.alerts))
          if (row.project_id === p.id && row.state !== 'resolved' && !active.has(aid)) Object.assign(row, { state: 'resolved', last_seen: now });
        const body = sortedJson(result), rows = this.db.history.filter(h => h.project_id === p.id);
        if (!rows.length || rows[rows.length - 1].body !== body) {
          this.db.history.push({ id: ++this.db.seq, project_id: p.id, scanned_at: now, body });
          const keep = new Set(this.db.history.filter(h => h.project_id === p.id).slice(-this.historyLimit).map(h => h.id));
          this.db.history = this.db.history.filter(h => h.project_id !== p.id || keep.has(h.id));
        }
      }
      this.db.settings.last_scan = now;
      return now;
    }
    state() {
      const projects = this.projects().map(p => {
        const rows = this.db.history.filter(h => h.project_id === p.id), report = JSON.parse(rows[rows.length - 1].body);
        return { project: p, report, brief: brief(report) };
      });
      const alerts = Object.keys(this.db.alerts).sort(cmpStr).map(id => {
        const row = this.db.alerts[id];
        return { ...JSON.parse(row.body), state: row.state, first_seen: row.first_seen, last_seen: row.last_seen, acknowledged_at: row.acknowledged_at };
      });
      return { projects, alerts, as_of: this.asOf(), last_scan: this.db.settings.last_scan || null };
    }
    _project(pid) {
      if (typeof pid !== 'string' || !has(this.db.projects, pid)) throw new ValidationError('Unknown project');
      return JSON.parse(this.db.projects[pid]);
    }
    _save(p) { validate(p); this.db.projects[p.id] = JSON.stringify(p); this._scan(); }
    importProject(p) {
      validate(p);
      return this.transact(() => {
        if (has(this.db.projects, p.id)) preserveBaseline(JSON.parse(this.db.projects[p.id]), p);
        else if (Object.keys(this.db.projects).length >= 20) throw new ValidationError('Local workspace limit: 20 projects');
        this.db.projects[p.id] = JSON.stringify(p);
        this._scan();
      });
    }
    updateTask(pid, tid, changes) {
      const allowed = new Set(['status', 'progress', 'owner', 'due_date']);
      if (!isObj(changes) || !Object.keys(changes).length || Object.keys(changes).some(k => !allowed.has(k)))
        throw new ValidationError('Only status, progress, owner and due_date can be edited here');
      return this.transact(() => {
        const p = this._project(pid), task = p.tasks.find(t => t.id === tid);
        if (!task) throw new ValidationError('Unknown task');
        const stamp = this.asOf();
        Object.assign(task, changes);
        task.updated_at = stamp;
        task.completed_at = task.status === 'done' ? (truthy(task.completed_at) ? task.completed_at : stamp) : null;
        task.blocked_since = task.status === 'blocked' ? (truthy(task.blocked_since) ? task.blocked_since : stamp) : null;
        this._save(p);
      });
    }
    acknowledge(aid) {
      return this.transact(() => {
        const row = typeof aid === 'string' && has(this.db.alerts, aid) ? this.db.alerts[aid] : null;
        if (!row || row.state === 'resolved') throw new ValidationError('No active alert with that ID');
        if (row.state !== 'acknowledged') Object.assign(row, { state: 'acknowledged', acknowledged_at: this.now() });
      });
    }
    updateStatus(pid, changes) {
      const allowed = new Set(['spent', 'quality', 'decisions', 'team']);
      if (!isObj(changes) || !Object.keys(changes).length || Object.keys(changes).some(k => !allowed.has(k)))
        throw new ValidationError('Only spend, quality, decisions and team capacity may change');
      return this.transact(() => { const p = this._project(pid); Object.assign(p, changes); this._save(p); });
    }
    addTask(pid, task) {
      return this.transact(() => {
        const p = this._project(pid);
        if (!isObj(task) || task.baseline_points !== 0) throw new ValidationError('Added work must have zero baseline points');
        p.tasks.push(task);
        this._save(p);
      });
    }
    deleteProject(pid) {
      return this.transact(() => {
        this._project(pid);
        if (Object.keys(this.db.projects).length <= 1) throw new ValidationError('Keep at least one project. Create or import another before deleting this one.');
        delete this.db.projects[pid];
        for (const [aid, row] of Object.entries(this.db.alerts)) if (row.project_id === pid) delete this.db.alerts[aid];
        this.db.history = this.db.history.filter(h => h.project_id !== pid);
        this._scan();
      });
    }
    setDate(value) {
      if (truthy(value)) day(value);
      return this.transact(() => { this.db.settings.as_of = truthy(value) ? value : ''; this._scan(); });
    }
    history(pid, limit = 100) {
      return this.db.history.filter(h => h.project_id === pid).slice(-limit).map(h => compact(h.scanned_at, JSON.parse(h.body)));
    }
  }

  // ---------- api.py ----------
  class Api {
    constructor(store, meta) { this.store = store; this.meta = meta; }
    monitorOnce() {
      try { this.store.scan(); this.meta.monitor_error = null; }
      catch (e) { this.meta.monitor_error = 'Monitor input could not be processed; last valid results retained. ' + String(e.message).slice(0, 250); }
    }
    state() { return { ...this.store.state(), monitor: clone(this.meta) }; }
    get(path, query) {
      if (path === '/api/state') return [200, this.state()];
      if (path === '/api/history') return [200, this.store.history(query.get('project') || '')];
      return null;
    }
    post(path, data) {
      try {
        if (!isObj(data)) throw new ValidationError('Expected JSON object');
        const s = this.store;
        if (path === '/api/import') s.importProject(req(data, 'project'));
        else if (path === '/api/task') s.updateTask(req(data, 'project_id'), req(data, 'task_id'), req(data, 'changes'));
        else if (path === '/api/status') s.updateStatus(req(data, 'project_id'), req(data, 'changes'));
        else if (path === '/api/add-task') s.addTask(req(data, 'project_id'), req(data, 'task'));
        else if (path === '/api/delete-project') s.deleteProject(req(data, 'project_id'));
        else if (path === '/api/acknowledge') s.acknowledge(req(data, 'alert_id'));
        else if (path === '/api/date') s.setDate(data.as_of);
        else if (path === '/api/scan') this.monitorOnce();
        else if (path === '/api/brief') {
          const item = s.state().projects.find(p => p.project.id === req(data, 'project_id'));
          if (!item) throw new ValidationError('Unknown project');
          return [200, brief(item.report)];
        } else return [404, { error: 'Not found' }];
        return [200, this.state()];
      } catch (e) {
        if (e instanceof KeyErr) return [400, { error: 'Missing field: ' + e.message }];
        if (e instanceof ValidationError || e instanceof TypeError) return [400, { error: e.message }];
        return [500, { error: 'Operation failed. Existing state was preserved.' }];
      }
    }
  }

  // ---------- Browser backend used by app.js when no local server is present ----------
  function createBrowserBackend({ storageKey = 'project-sentinel-demo-v1', interval = 60 } = {}) {
    const meta = { mode: 'browser', interval_seconds: interval, model_configured: false, monitor_error: null, watching_file: false, storage: 'browser' };
    let data = null;
    try { const raw = root.localStorage && root.localStorage.getItem(storageKey); if (raw) data = JSON.parse(raw); } catch (e) { data = null; }
    const save = db => {
      try { root.localStorage.setItem(storageKey, JSON.stringify(db)); meta.storage = 'browser'; }
      catch (e) { meta.storage = 'memory'; }
    };
    let store;
    try { store = new Store({ data, save, historyLimit: 40 }); }
    catch (e) { store = new Store({ save, historyLimit: 40 }); }
    save(store.db);
    const api = new Api(store, meta);
    const timer = setInterval(() => api.monitorOnce(), interval * 1000);
    return {
      meta,
      request(path, data) {
        const url = new URL(path, 'http://sentinel.local');
        const result = data === undefined ? api.get(url.pathname, url.searchParams) || [404, { error: 'Not found' }]
          : api.post(url.pathname, clone(data));
        return { ok: result[0] < 400, status: result[0], body: clone(result[1]) };
      },
      reset() { clearInterval(timer); try { root.localStorage.removeItem(storageKey); } catch (e) { /* storage unavailable */ } },
    };
  }

  const SentinelBrowser = { ValidationError, validate, preserveBaseline, analyze, brief, expectedAt, planCurve, demoProjects, demoHistory, Store, Api, createBrowserBackend, _fmt: { pyFixed, pyG, pyComma0, pyRound, pyJson, sha256hex, isoFromDays, day } };
  if (typeof module === 'object' && module.exports) module.exports = SentinelBrowser;
  else root.SentinelBrowser = SentinelBrowser;
})(typeof globalThis !== 'undefined' ? globalThis : this);
