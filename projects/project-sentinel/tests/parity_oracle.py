"""Reference results from the Python implementation, consumed by tests/parity.cjs."""
import json
import sys
import tempfile
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from engine import analyze, preserve_baseline, ValidationError  # noqa: E402
from samples import demo_projects, demo_history  # noqa: E402
from store import Store  # noqa: E402
from api import Api  # noqa: E402


def outcome(fn):
    try:
        return {'ok': fn()}
    except ValidationError as e:
        return {'error': str(e)}
    except Exception as e:  # noqa: BLE001 - recorded for comparison
        return {'error': 'unexpected: ' + type(e).__name__}


def main():
    job = json.load(sys.stdin)
    seed = date.fromisoformat(job['seed_day'])
    out = {
        'samples': demo_projects(seed),
        'history': {p['id']: demo_history(p, seed) for p in demo_projects(seed)},
        'analyze': [outcome(lambda c=c: analyze(c['project'], c['as_of'])) for c in job['analyze']],
        'preserve': [outcome(lambda c=c: preserve_baseline(c['old'], c['new']) or True) for c in job['preserve']],
    }
    with tempfile.TemporaryDirectory() as tmp:
        api = Api(Store(Path(tmp) / 'parity.sqlite3'), {'mode': 'parity'})
        steps = []
        for method, path, data in job['lifecycle']:
            status, body = api.get(path, {'project': [data]}) if method == 'GET' else api.post(path, data)
            steps.append([status, body])
        out['lifecycle'] = steps
    json.dump(out, sys.stdout)


if __name__ == '__main__':
    main()
