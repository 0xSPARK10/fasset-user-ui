# QA scenarios (developer proposals)

Scenario proposals written by developers while building a feature, for the QA team
(`minting-app-qa`) to turn into Playwright tests. The files follow that repo's
`scenarios/_template.md` and `scenarios/README.md`, so a file can be copied to
`scenarios/<scenario_group>/` there and finished. The QA repo stays the source of truth; this
folder is input.

The QA repo includes this repo as a submodule, so these files are visible there as they are.

## When to add or update

- A new flow, route or status the user can reach → its happy path and its failure paths.
- An edge case found while building or fixing (a bug that must not come back, a state that is
  hard to reach) → a scenario, with **how to trigger it** in Preconditions.
- Behavior changed → update the scenario. A scenario that no longer applies → add the tag
  `obsolete` (do not delete — QA may have a test with that id).

## Layout

`docs/qa-scenarios/<scenario_group>/<id>.md` — one file per scenario, `id` = file name,
`scenario_group` = folder (`bridge`, `mint`, `redeem`, `pools`, `tags`, `wallet_connect`, `home`).
No subfolders — in the QA repo a folder is one test user. Group by **id prefix** instead
(`bridge-route-*`, `bridge-recovery-*`, `bridge-guard-*`, …) and keep an index in
`<scenario_group>/README.md`.

## Frontmatter

```yaml
---
id: bridge-recovery-happy-path            # = file name
title: Mint & Bridge Recovery — Recover to the Personal Account
scenario_group: bridge                     # = folder
tags: [dev-proposal, p1, trigger-ui]
networks: [coston2]                        # omit when it applies to every network
---
```

| Tag | Meaning |
|---|---|
| `dev-proposal` | written here, not yet taken over by QA |
| `p1` / `p2` / `p3` | `p1` money can be lost or stuck · `p2` user blocked or misled · `p3` cosmetic / rare |
| `trigger-ui` | reachable by clicking |
| `trigger-harness` | needs a direct API / contract call or a mocked response |
| `trigger-backend` | needs a backend / ops action |
| `obsolete` | no longer applies |

`wallets`, `domain`, `requires`, `verifies` and `tier` are left to QA (they name the QA
repo's wallet mocks, domain files and funding). Values to check against a source other than
the screen go under Expected Results as `- [ ] Verify: …` with the source and relation, e.g.
`Personal Account FXRP: after = before + amount` — QA moves them to `verifies`.

## Body

`# <Title>`, then `## Context`, `## Preconditions`, `## Steps` (`1.` list, starting with
"Navigate to the base URL" and "Connect wallet using steps from `connect-wallet.md`"),
`## Expected Results` (`- [ ]` checklist), `## Edge Cases` ("Does NOT test …", pointing to
sibling scenarios) and `## Domain References`.

UI texts are quoted from `src/languages/en.json` — when a text changes, search that file for it.

## Note for QA (2026-11-05)

The bridge page is redesigned on `develop` (next release, not live yet): one FROM → TO chain picker on `/bridge` instead of the
balance cards with per-row modals. The existing `scenarios/bridge/*` specs in the QA repo
("Bridge to XRPL" button, "Edit" link, modal titles like "Bridge FTestXRP to Hyperliquid")
describe the old page and need rewriting once it ships.
