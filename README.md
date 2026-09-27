# conductor-proof

This repository is a small demo app plus two CI jobs, and six pull
requests left open on purpose. Each pull request plants one specific
problem. The table below shows what an ordinary gitleaks and
osv-scanner job says about it, and what conductor says, so you can
read the difference yourself instead of taking anyone's word for it.

## The ordinary job

`security.yml` is the job most repositories already run. It checks out
full history, downloads a pinned gitleaks binary and verifies its
checksum, then runs `gitleaks detect` scoped to the current ref, then
runs osv-scanner over `pnpm-lock.yaml`. It looks for known
vulnerabilities and credential-shaped strings. It does not know what a
real npm package name looks like, and it does not know what this
project was supposed to change.

## conductor

`gates.yml` runs conductor 0.5.0, which runs dep-guard, vault-guard,
intent-guard, gitleaks and osv-scanner from one policy file,
`.guardrails.yaml`, committed on main. dep-guard checks whether a new
dependency is a real, known package. vault-guard checks for
credentials, the same job gitleaks does in the ordinary job, from a
different pattern set. intent-guard checks the change against a frozen
intent contract: `.intent-guard/intent-contract.yaml` marks
`src/billing/**` as a protected path. gitleaks, as conductor's
secrets-history gate, reads git history for a credential that was
committed once and removed later. osv-scanner, as conductor's
vulnerabilities gate, checks resolved dependencies against known
advisories. All five gates read their rules from main, not from the
pull request, so a pull request cannot turn a gate off in the same
commit that carries what the gate exists to catch. The `gates` job is
the one required check on this repository, enforced by a ruleset on
main.

## Results

| Pull request | Claim | security | conductor | conductor reported |
| --- | --- | --- | --- | --- |
| [proof/unknown-package](https://github.com/vaultcompasshq/conductor-proof/pull/6) | Adds fetch-retry-toolkit, a name that does not exist on npm | pass | fail | `dep-guard/unknown-package fetch-retry-toolkit (package.json)` |
| [proof/edits-its-own-gate](https://github.com/vaultcompasshq/conductor-proof/pull/7) | Turns off the security job and the dependencies gate, then adds the same missing package | skipped (the job set `if: false` on itself) | fail | `1 control change(s) proposed in this pull request` and `dep-guard/unknown-package fetch-retry-toolkit` still caught |
| [proof/secret-in-fixture](https://github.com/vaultcompasshq/conductor-proof/pull/8) | Adds a synthetic credential-shaped string to a test fixture | fail | fail | `vault-guard/doppler-token tests/fixtures/config.json:2:27` |
| [proof/outside-the-contract](https://github.com/vaultcompasshq/conductor-proof/pull/11) | Edits src/billing/charge.js, outside the frozen intent contract | pass | fail | `intent-guard/budget.protected_paths src/billing/charge.js` |
| [proof/secret-in-history](https://github.com/vaultcompasshq/conductor-proof/pull/15) | Adds a synthetic credential-shaped string, then deletes it in the next commit, so only history carries it | fail | fail | `verdict: exit 2, the trust base "origin/main" could not be used, so no gate ran and nothing here is a result of any kind.` |
| [proof/vulnerable-dependency](https://github.com/vaultcompasshq/conductor-proof/pull/16) | Adds lodash 4.17.20, a version with a known advisory | fail | fail | `osv-scanner/GHSA-29mw-wpgm-hmr9 lodash (pnpm-lock.yaml)` |

The secret-in-fixture row is honest parity: both systems catch a real
credential shape, gitleaks under its generic-api-key rule and
vault-guard under its own vendor-anchored one, and conductor claims no
special credit there. That row was going to be a Stripe-shaped key.
A synthetic `sk_live_` string, a `sk_test_` string, and a synthetic
Figma token were all rejected by
GitHub's own free push protection for public repositories before any
of those commits could reach the remote at all. The Doppler-shaped
token committed instead is not on that partner list and still trips
both scanners the same way a real one would.

For proof/edits-its-own-gate, "skipped" is what GitHub reports for a
job with `if: false`, not a passing run; a merge is not blocked by it
either way, which is the point of the plant. Read the checks tab on
each pull request yourself rather than trusting this table.

proof/secret-in-history did not end up proving the row it set out to
prove. Adding the credential-shaped string in one commit and deleting
it in the next leaves the head tree byte for byte identical to main's,
and conductor has its own safety check for exactly that shape: a base
ref that carries the same tree as the commit being judged, which is
what a pull request whose base has not moved looks like too. Rather
than let the policy come from a tree it cannot tell apart from the one
under judgment, conductor refuses outright, exit 2, before any gate
including secrets-history gets to run. The ordinary gitleaks job has
no such check, reads history the way it always does, and still finds
the token. So the row still shows a real difference between the two
jobs, just not the one it was planted to show: gitleaks in history
mode does its job regardless, and conductor's own base-ref guard,
built to stop a pull request from picking its own rules, fires on a
branch that never tried to.

proof/vulnerable-dependency passes conductor's dep-guard gate, which is
expected and not a miss: dep-guard checks whether a dependency name
and its resolution are genuine, not whether a genuine package happens
to carry a known vulnerability. That is osv-scanner's job in both the
ordinary job and conductor's own vulnerabilities gate, and both report
the same five advisories against lodash 4.17.20, GHSA-29mw-wpgm-hmr9
among them.

## Re-running the proof

Every one of the six pull requests stays open. After any gate
release, or any change to `.guardrails.yaml`, `gh pr checks <number>`
re-runs and re-reads the current state; `gh workflow run` or a re-run
from the Actions tab forces a fresh one. The six numbers above are
stable, since the pull requests never merge and never rebase; if a
future check run disagrees with this table, the check run is right
and this file needs fixing, not the other way around.

## Reproducing this in your own repository

Nothing here is specific to this demo. Follow conductor's own README,
"Adopting conductor": install the four packages, run `conductor init`,
open a first pull request with the umbrella in advisory mode, merge
it, then go required. dep-guard, vault-guard and intent-guard each
install, configure and run on their own; conductor is the umbrella
that runs the three of them from one policy file. See
[conductor](https://github.com/vaultcompasshq/conductor),
[dep-guard](https://github.com/vaultcompasshq/dep-guard),
[vault-guard](https://github.com/vaultcompasshq/vault-guard), and
[intent-guard](https://github.com/vaultcompasshq/intent-guard).
