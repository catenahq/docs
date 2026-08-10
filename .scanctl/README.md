# scanctl baseline

`baseline.sarif` is a committed set of security findings for THIS repo that
are reviewed and accepted as benign. For how the mechanism works generally
(what `baseline:`/`--dismiss-baseline` do, how to seed or regenerate a
baseline, the drift-check pattern) see
[catenahq/scanctl's README](https://github.com/catenahq/scanctl#baseline-gate-only-on-new-findings) --
this file only records what's baselined here and why.

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

`baseline-drift.yml` re-scans WITHOUT the baseline and runs `drift-check.py`
(repo-local copy of the comparator scanctl's README documents) weekly + on
`workflow_dispatch`, triggered also by changes to `package-lock.json` /
`package.json` / `renovate.json` / `.scanctl/**`. On drift, regenerate per
scanctl's README ("Seeding or regenerating a baseline") and review the diff --
every entry must be a finding a human has confirmed is benign here.
