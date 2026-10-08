#!/usr/bin/env python3
"""Run the portfolio's dependency-free engine, HTTP and CLI checks."""
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def main():
    if sys.version_info < (3, 10):
        print("Python 3.10+ is required.", file=sys.stderr)
        return 1
    node = shutil.which("node")
    if not node:
        print("Install Node.js 20+ and rerun this command.", file=sys.stderr)
        return 1
    version = subprocess.run([node, "--version"], capture_output=True, text=True, check=True)
    if int(version.stdout.strip().lstrip("v").split(".")[0]) < 20:
        print("Node.js 20+ is required.", file=sys.stderr)
        return 1
    checks = [
        ("Sentinel Python and HTTP tests", "projects/project-sentinel",
         [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"], 0, None),
        ("AgentTrace engine tests", "projects/agenttrace",
         [node, "--test", "tests/engine.test.js"], 0, None),
        ("API launch engine tests", "projects/api-launch-readiness",
         [node, "--test", "test_engine.cjs"], 0, None),
    ]
    for sample, expected, verdict in [
        ("clean", 0, "READY FOR HUMAN REVIEW"),
        ("risky", 2, "HOLD"),
        ("sparse", 2, "INSUFFICIENT EVIDENCE"),
    ]:
        checks.append((f"AgentTrace {sample} CLI", "projects/agenttrace",
                       [node, "cli.js", f"examples/{sample}.json"], expected, verdict))
    failures = []
    for label, directory, command, expected, verdict in checks:
        print(f"\n--- {label} ---", flush=True)
        try:
            result = subprocess.run(command, cwd=ROOT / directory, capture_output=True,
                                    text=True, timeout=120)
            print(result.stdout, end="")
            print(result.stderr, end="", file=sys.stderr)
            passed = result.returncode == expected and (verdict is None or verdict in result.stdout)
            if not passed:
                failures.append(label)
                print(f"FAIL: expected exit {expected}, got {result.returncode}", file=sys.stderr)
        except (OSError, subprocess.TimeoutExpired) as error:
            failures.append(label)
            print(f"FAIL: {error}", file=sys.stderr)
    print(f"\n{len(checks) - len(failures)}/{len(checks)} verification groups passed.")
    print("This does not run browser, accessibility, live-model or production checks.")
    if failures:
        print("Failed groups: " + ", ".join(failures), file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
