"""Transport-independent API routes for the local server (app.py).

The no-install browser demo (static/sentinel-browser.js) mirrors these routes and
response shapes; tests/parity.cjs checks that both implementations agree.
"""
from engine import ValidationError
from assistant import local_brief


class Api:
    def __init__(self, store, meta, model=None, monitor_once=None):
        self.store, self.meta, self.model = store, meta, model
        self.monitor_once = monitor_once or store.scan

    def state(self):
        return dict(**self.store.state(), monitor=self.meta)

    def get(self, path, query):
        """Return (status, body) for an API path, or None when the path is not an API route."""
        if path == '/api/state':
            return 200, self.state()
        if path == '/api/history':
            return 200, self.store.history(query.get('project', [''])[0])
        return None

    def post(self, path, data):
        try:
            if not isinstance(data, dict):
                raise ValidationError('Expected JSON object')
            if path == '/api/import': self.store.import_project(data['project'])
            elif path == '/api/task': self.store.update_task(data['project_id'], data['task_id'], data['changes'])
            elif path == '/api/status': self.store.update_status(data['project_id'], data['changes'])
            elif path == '/api/add-task': self.store.add_task(data['project_id'], data['task'])
            elif path == '/api/delete-project': self.store.delete_project(data['project_id'])
            elif path == '/api/acknowledge': self.store.acknowledge(data['alert_id'])
            elif path == '/api/date': self.store.set_date(data.get('as_of'))
            elif path == '/api/scan': self.monitor_once()
            elif path == '/api/brief':
                item = next((p for p in self.store.state()['projects'] if p['project']['id'] == data['project_id']), None)
                if not item:
                    raise ValidationError('Unknown project')
                return 200, local_brief(item['report'], self.model)
            else:
                return 404, {'error': 'Not found'}
            return 200, self.state()
        except KeyError as e:
            return 400, {'error': f'Missing field: {e.args[0]}'}
        except (ValidationError, ValueError, TypeError) as e:
            return 400, {'error': str(e)}
        except Exception:
            return 500, {'error': 'Operation failed. Existing state was preserved.'}
