"""Analyze a project without the web server; useful for exports and scheduled local jobs."""
import argparse,json
from datetime import date
from pathlib import Path
from engine import analyze,brief,ValidationError

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('input',type=Path)
    parser.add_argument('--as-of',default=date.today().isoformat())
    parser.add_argument('--output',type=Path)
    a=parser.parse_args()
    try:
        report=analyze(json.loads(a.input.read_text()),a.as_of)
        output=json.dumps(dict(**report,brief=brief(report)),indent=2)
        if a.output: a.output.write_text(output+'\n')
        else: print(output)
    except (OSError,ValueError) as e:
        parser.exit(2,f'Could not analyze project: {e}\n')
if __name__=='__main__': main()
