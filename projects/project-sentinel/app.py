#!/usr/bin/env python3
"""Run with: python3 app.py. A private, single-user local server."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import argparse
import hashlib
import json
import mimetypes
import os
import threading
import time
from engine import ValidationError
from store import Store
from api import Api

ROOT=Path(__file__).resolve().parent
STATIC_ROUTES={'/':'index.html','/app.js':'app.js','/style.css':'style.css'}


def make_server(store,port=8765,model=None,interval=60,watch=None):
    meta={'mode':'local','interval_seconds':interval,'model_configured':bool(model),'monitor_error':None,'watching_file':bool(watch)}
    stop=threading.Event()
    watch_hash=None
    def monitor_once():
        nonlocal watch_hash
        try:
            if watch:
                raw=Path(watch).read_bytes()
                digest=hashlib.sha256(raw).hexdigest()
                if digest!=watch_hash:
                    store.import_project(json.loads(raw))
                    watch_hash=digest
            store.scan()
            meta['monitor_error']=None
        except Exception as e:
            meta['monitor_error']='Monitor input could not be processed; last valid results retained. '+str(e)[:250]
    def loop():
        while not stop.wait(interval):
            monitor_once()
    api=Api(store,meta,model,monitor_once)
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args):
            pass
        def permitted(self):
            port=self.server.server_port
            hosts={f'127.0.0.1:{port}',f'localhost:{port}'}
            if self.headers.get('Host') not in hosts:
                return False
            origin=self.headers.get('Origin')
            return origin is None or origin in {f'http://{h}' for h in hosts}
        def send(self,status,body,content_type='application/json'):
            data=json.dumps(body).encode() if content_type=='application/json' else body.encode() if isinstance(body,str) else body
            self.send_response(status)
            self.send_header('Content-Type',content_type)
            self.send_header('Content-Length',str(len(data)))
            self.send_header('Cache-Control','no-store')
            self.send_header('X-Content-Type-Options','nosniff')
            self.send_header('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(data)
        def do_GET(self):
            if not self.permitted(): return self.send(403,{'error':'Use the local application address'})
            path=urlparse(self.path)
            result=api.get(path.path,parse_qs(path.query))
            if result: return self.send(*result)
            if path.path in STATIC_ROUTES:
                file=ROOT/'static'/STATIC_ROUTES[path.path]
                return self.send(200,file.read_bytes(),mimetypes.guess_type(file.name)[0] or 'text/plain')
            return self.send(404,{'error':'Not found'})
        def do_POST(self):
            if not self.permitted(): return self.send(403,{'error':'Request origin is not allowed'})
            if self.headers.get('Content-Type','').split(';')[0]!='application/json':
                return self.send(415,{'error':'Expected application/json'})
            try:
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=1000000:
                    raise ValidationError('Request size must be 1–1,000,000 bytes')
                data=json.loads(self.rfile.read(size))
            except (ValidationError,ValueError) as e:
                return self.send(400,{'error':str(e)})
            self.send(*api.post(urlparse(self.path).path,data))
    server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
    server.daemon_threads=True
    server.stop_monitor=stop.set
    server.monitor_once=monitor_once
    if watch: monitor_once()
    threading.Thread(target=loop,daemon=True).start()
    return server


def main():
    parser=argparse.ArgumentParser(description='Project Sentinel local monitoring server')
    parser.add_argument('--port',type=int,default=8765)
    parser.add_argument('--data-dir',default=str(ROOT/'data'))
    parser.add_argument('--interval',type=int,default=60)
    parser.add_argument('--watch',help='Optional JSON project file to re-import when changed')
    parser.add_argument('--model',default=os.environ.get('SENTINEL_MODEL'),help='Optional installed Ollama model name')
    args=parser.parse_args()
    if args.interval<5: parser.error('interval must be at least 5 seconds')
    server=make_server(Store(Path(args.data_dir)/'sentinel.sqlite3'),args.port,args.model,args.interval,args.watch)
    print(f'Project Sentinel: http://127.0.0.1:{server.server_port}',flush=True)
    print(f'Automatic scan every {args.interval}s. Keep this process and laptop awake. Ctrl+C to stop.',flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.stop_monitor();server.server_close()

if __name__=='__main__': main()
