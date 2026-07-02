# scanctl baseline

`baseline.sarif` is a committed set of security findings that are reviewed and
accepted as benign. `security.yml` passes it to scanctl (`baseline:
.scanctl/baseline.sarif`), which marks matching findings as suppressed so
per-PR code scanning stays clean while every finding remains auditable in the
SARIF. Only NEW findings gate or surface.

## What is currently baselined

- **14 x trivy-license (LGPL-3.0-or-later)** on `@img/sharp-libvips-*` /
  `@img/sharp-*`. `sharp` is Astro's build-time image optimizer; it bundles
  libvips (LGPL). It runs only at build time and is not shipped in the deployed
  static site, so the copyleft obligation does not attach. Benign.
- **3 x semgrep `renovate-missing-minimum-release-age`** on `renovate.json`.
  False positive: the rule reads the file statically and cannot follow the
  remote `extends` chain (docs -> `catenahq/renovate-config` ->
  `catenahq/scanctl:secure-base`), which sets `minimumReleaseAge: 7 days`. The
  cooldown is in effect.

## Drift detection

`baseline-drift.yml` re-scans WITHOUT the baseline and runs `drift-check.py` to
compare live findings against the committed baseline. It fails on:

- **STALE** - a baseline entry the scan no longer produces (prune it).
- **NEW** - a finding the baseline does not cover (review, then fix or
  re-accept).

It triggers on changes to `package-lock.json` / `package.json` / `renovate.json`
/ `.scanctl/**`, weekly, and via `workflow_dispatch`.

## Regenerating the baseline

When drift-check reports a legitimate change to re-accept:

```sh
scanctl run --profile full --out current.sarif --sbom /tmp/sbom.json \
  --summary /dev/null .
python3 - <<'PY'
import json
rep = json.load(open("current.sarif"))
runs = [
    {"tool": {"driver": {"name": r["tool"]["driver"]["name"]}}, "results": r["results"]}
    for r in rep.get("runs", []) if r.get("results")
]
out = {"$schema": rep["$schema"], "version": rep["version"], "runs": runs}
json.dump(out, open(".scanctl/baseline.sarif", "w"), indent=2)
open(".scanctl/baseline.sarif", "a").write("\n")
PY
```

Review the diff before committing: every entry must be a finding you have
confirmed is benign.
