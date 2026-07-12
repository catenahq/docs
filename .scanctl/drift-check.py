#!/usr/bin/env python3
"""Drift check for the committed scanctl baseline.

Usage: drift-check.py <baseline.sarif> <current.sarif>

Compares the fingerprint set of a freshly produced scanctl SARIF against the
committed baseline. Exits non-zero when they diverge, so a stale or incomplete
baseline cannot silently rot:

  STALE - a baseline entry the scan no longer produces (a suppressed finding
          disappeared: prune it, or the baseline is masking nothing).
  NEW   - a finding the baseline does not cover (a dependency/license/rule
          changed: review it, then fix the cause or re-accept by regenerating
          the baseline).

The fingerprint mirrors scanctl internal/sarif.Fingerprint so "stale"/"new"
here mean exactly what scanctl would match or miss. The comparison is
self-consistent regardless: both files are hashed by the same function.
"""
import hashlib
import json
import sys


def primary_loc(r):
    locs = r.get("locations") or []
    if not locs:
        return ""
    pl = locs[0].get("physicalLocation", {})
    uri = pl.get("artifactLocation", {}).get("uri", "")
    if not uri:
        return ""
    line = (pl.get("region") or {}).get("startLine") or 0
    return f"{uri}:{line}" if line > 0 else uri


def fingerprint(tool, r):
    h = (r.get("partialFingerprints") or {}).get("primaryLocationLineHash")
    if h:
        return f"{tool}:{r.get('ruleId', '')}:{h}"
    msg = (r.get("message") or {}).get("text", "")
    raw = f"{tool}\x00{r.get('ruleId', '')}\x00{primary_loc(r)}\x00{msg}"
    return hashlib.sha256(raw.encode()).hexdigest()


def fingerprints(path):
    with open(path) as f:
        rep = json.load(f)
    out = {}
    for run in rep.get("runs", []):
        tool = run.get("tool", {}).get("driver", {}).get("name", "")
        for r in run.get("results", []):
            out[fingerprint(tool, r)] = (tool, r.get("ruleId", ""), primary_loc(r))
    return out


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    base = fingerprints(sys.argv[1])
    cur = fingerprints(sys.argv[2])

    stale = [base[k] for k in base if k not in cur]
    new = [cur[k] for k in cur if k not in base]

    if not stale and not new:
        print(f"baseline in sync: {len(base)} finding(s), no drift")
        return 0

    if stale:
        print(f"STALE baseline entries ({len(stale)}) no longer produced by the scan:")
        for tool, rid, loc in stale:
            print(f"  - {tool} {rid} {loc}")
    if new:
        print(f"NEW findings ({len(new)}) not covered by the baseline:")
        for tool, rid, loc in new:
            print(f"  + {tool} {rid} {loc}")
    print("\nReview the cause, then regenerate the baseline (see .scanctl/README.md).")
    return 1


if __name__ == "__main__":
    sys.exit(main())
