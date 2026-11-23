# FAsset User UI

## ⚠ CRITICAL — Never Break These
- **Never run any npm/yarn/npx/next command from repo root** — ONLY from `src/`
- **Never run `next build`** to check types — creates junk files at wrong level
- To verify types: `cd src && node_modules/.bin/tsc --noEmit` (safe — writes nothing but the gitignored tsbuildinfo)
- Dev: `cd src && npm run dev`

## Project Layout
- Next.js root = `src/` (Pages Router, not App Router)
- `components/` `hooks/` `api/` `config/` `styles/` `pages/`
- `abi.ts` · `constants.ts` · `types.ts` · `utils.ts`

## Tech Stack
Next.js + TypeScript · Mantine v7 · React Query · ethers.js v6
LayerZero · xrpl · i18next · Tailwind + SCSS modules

## UI Rules
- **Always use Mantine v7 components** — Button, TextInput, NumberInput, Modal, Loader, Grid, etc.
- Never use raw `<input>` `<button>` `<select>` when Mantine equivalent exists
- If component missing from Mantine → ask user before custom implementation
- Use Mantine MCP tools (`mcp__mantine__search_docs`, `mcp__mantine__get_item_doc`, `mcp__mantine__get_item_props`) to look up component docs and props before implementing
- Mantine LLM docs index: https://mantine.dev/llms.txt

## Code Conventions
- Forms: `useForm` + `yupResolver(yup schema)` + `forwardRef` with `FormRef`
- Contract calls: `useMutation` hooks in `useContracts.ts`
- Amounts: 6 decimals — always `parseUnits(value, 6)`
- Lots: `toLots()` / `fromLots()` from `utils.ts` (1 lot = lotSize tokens, e.g. 10 FXRP)
- Bridge types: `HYPER_EVM` `HYPER_CORE` `FLARE` `XRPL` — from `constants.ts`
- Translations: `t('key')` via `useTranslation()`, keys in `languages/en.json`
- Logging: `devLog` / `devError` from `@/utils/debug` — **never `console.log` directly**

## Code Quality
- **Smallest diff that solves the task.** No drive-by refactors, renames or reformatting — mention them instead.
- **Reuse first:** search `utils/`, `hooks/`, `core/`, `components/elements` before writing a helper, hook or component (`toLots`, `parseUnits(x, 6)`, `devLog`, `FormAlert` …).
- **Where code goes:** domain rules and calculations → `core/<domain>/` (`*Rules.ts`, `*Calculator.ts`), pure functions without React so they are unit-testable; data/contract hooks → `hooks/`; UI → `components/<feature>/`. Keep feature-only code next to the feature; extract to shared only at 3+ uses.
- **No speculative code** (options, wrappers, generic params nobody uses) and **no defensive noise** (try/catch or fallbacks for impossible cases).
- **Types:** see TypeScript below.
- **No React Compiler in this repo** — `useMemo`/`useCallback` are legitimate where they prevent real re-render/identity issues; don't add them by reflex, don't strip existing ones.
- **Flare FE guide** (company standard: Vite, TanStack Router, React 19 …) is the target for new projects. Here apply only its stack-independent rules (colocation, no prop drilling, pass objects, avoid unnecessary `useEffect`, naming, types) — don't migrate stack or file naming unless that is the task.
- **Readable over clever:** clear names, early returns, small functions, no nested ternaries. Comments explain *why*, never *what*.
- **Follow the file you're in:** match its existing patterns and naming, even if you'd do it differently.
- **Medium+ task → plan first:** list files and approach, wait for a go.
- **Done means verified:** lint + `tsc --noEmit` clean before saying done; say plainly what you didn't verify (e.g. wallet flows not run).

## TypeScript
Lint warns on `any`, `!`, object-literal `as` and `@ts-ignore`. The lint hook reports only lines you changed: fix those, leave old debt alone.
- **No `as` to make errors go away.** Narrow instead: a type guard (`function isFAssetCoin(c: ICoin): c is IFAssetCoin`), `in` / `typeof` checks, or a discriminated union with a literal field (`kind: 'fasset' | 'native'`). `as const` is fine.
- **`satisfies`** for config objects and lookup maps: checks the shape and keeps literal types (`const X = {...} satisfies Record<BridgeType, Cfg>`).
- **Derive, don't duplicate:** `Pick` / `Omit` / `Partial` from existing types, `typeof CONST[number]` for unions from constants, `yup.InferType<typeof schema>` for form values, `ReturnType` / `Awaited` for hook and API results.
- **No `!`:** handle the missing case with an early return or a default that is actually valid.
- **Exhaustive `switch`** on unions (`BridgeType`, statuses): end with `default: { const _exhaustive: never = x; }`.
- **`unknown` at boundaries** (API responses, `JSON.parse`, wallet payloads), then validate or narrow. Never `any`.
- **Where types live:** new domain types → `core/<domain>/types.ts` (like `core/bridge/types.ts`); don't grow `types.ts` (870 lines). Component props stay in the component file.
- **Explicit return types** on exported functions in `core/`, `hooks/`, `api/`, `utils/`.

## Required Reading — Before Any Implementation

**Always read these before starting a task:**
- `docs/DEV_SPEC.md` — domain concepts, technical flows, APIs, fees, wallets, contracts, code patterns
- `docs/BUSINESS_RULES.md` — edge cases, constraints, decisions (update when you discover something non-obvious)

**Read when relevant to the task:**
- `docs/PRODUCT_OWNER.md` — product decisions, why, edge cases (read before roadmap/planning)
- `docs/migrations/` — contract changes per version (read when implementing features affected by contract changes)

## Keeping Docs Current — Before Commit / MR

Before proposing a commit or MR, check whether `docs/` needs an update, and do it via the `doc-update` skill:
- **Always:** add a line to `docs/CHANGELOG.md` → `[Unreleased]` for any user-visible change, fix, or removal
- **New/changed pattern, shared component, hook, or flow** → `docs/DEV_SPEC.md`
- **New edge case, constraint, or decision** → `docs/BUSINESS_RULES.md`
- **Product-level change** (new route/chain, removed feature) → `docs/PRODUCT_OWNER.md`
- **New flow, status or edge case worth testing** (esp. failure / recovery paths and how to trigger them) → add or update a scenario in `docs/qa-scenarios/<scenario_group>/<id>.md` (one file per scenario, QA repo's format — see `docs/qa-scenarios/README.md`) — QA turns these into Playwright tests. Public file: no names, secrets or internal URLs

Pure refactors with no behavior or pattern change need no doc update. If you skip it, say why.

## Release
`songbird-release` = what is live. Deployers check out **tags**, not the branch: `git fetch --tags && git checkout vX.Y.Z`. First tag: `v1.3.16` (baseline). Next planned: `1.4.0`.

**Normal release** — during work, just merge features/fixes into `develop` (no version or CHANGELOG edits needed). Then:
1. `git checkout develop && git pull`
2. `/release` — writes CHANGELOG `[X.Y.Z]` from commits since the last tag, syncs DEV_SPEC / BUSINESS_RULES, bumps `src/package.json`
3. Review → commit `chore(release): vX.Y.Z` → push to develop
4. MR `develop` → `songbird-release` → merge
5. `git checkout songbird-release && git pull && just release` — checks, then creates + pushes tag `vX.Y.Z`

**Hotfix** — only if it must go live before the next release; otherwise fix on develop and wait.
1. `git checkout -b fix-xyz origin/songbird-release` → fix → commit
2. Add one line to CHANGELOG `[Unreleased]`, then `just bump patch` (on the hotfix branch — never `/release`, develop may hold unreleased work) → commit, push
3. MR `fix-xyz` → `songbird-release` → merge → `just release`
4. MR `fix-xyz` → `develop` → merge (`just release` warns if songbird has commits develop lacks)

**Tools:** `just bump patch|minor|major` (+ `bump-check`) — version + CHANGELOG cut, no Claude. `just release` (+ `release-check`) — tag on songbird, reports patch/minor/major vs the last tag, refuses a version not higher than it.

Never commit, merge, push, or tag on the user's behalf — `/release` and `just bump` only prepare files.

## Git
Delete any root-level artifacts (package.json, tsconfig.json, yarn.lock, .next/, node_modules/) — created by mistake. Exceptions: `justfile` and `scripts/` belong at the root.

## Project History
See `docs/CHANGELOG.md` for released changes; session notes and decisions in `dev-docs/`.

## TODO Tracking
- Todo file: `dev-docs/TODO.md`
- Format ima tri tipe vnosov:
  - **Komponente/refaktoring** — opis + seznam fajlov ki jih treba posodobiti
  - **Open questions** — nejasnosti ki potrebujejo odgovor pred implementacijo
  - **Task Table** — odprte naloge (`todo` / `in-progress`)
  - **Low priority** — stari (že live) ali nenujni; ob začetku premakni v Task Table
  - **Done** — končane naloge, ločena tabela na dnu
- Ko najdeš bug, tech debt ali odprto vprašanje → dodaj v pravi sekcijo (nova številka = naslednja prosta)
- Ko začneš task → status na `in-progress`
- Ko končaš → status na `done` + kratka opomba (commit / kaj je ostalo), vrstico **premakni** iz Task Table v **Done** (številka ostane ista, ne briši)
- Sekcija, ki postane zastarela → označi (`~~naslov~~` / "zastarelo, glej #N"), ne briši
- Nove komponente dokumentiraj kot `FormAlert` — kaj zamenjuje, kje že implementirano, kje še treba

