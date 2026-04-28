# FAsset User UI

## ⚠ CRITICAL — Never Break These
- **Never run any npm/yarn/npx/next command from repo root** — ONLY from `src/`
- **Never run `next build`** to check types — creates junk files at wrong level
- To verify types: read code manually or ask user to run dev server
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

## Migration Reference
- `docs/migrations/MIGRATION_v1.3.md` — spec za v1.3 migracijo: novi contract functions, events, parameters, error codes
- Pri razvoju novih featureov ki se tičejo contract sprememb → preveri `docs/migrations/` za relevantno verzijo

## Required Reading — Before Any Implementation

**Always read these before starting a task:**
- `docs/DEV_SPEC.md` — domain concepts, technical flows, APIs, fees, wallets, contracts, code patterns
- `docs/BUSINESS_RULES.md` — edge cases, constraints, decisions (update when you discover something non-obvious)

**Read when relevant to the task:**
- `docs/PRODUCT_OWNER.md` — product decisions, why, edge cases (read before roadmap/planning)
- `docs/migrations/` — contract changes per version (read when implementing features affected by contract changes)

## Git
Delete any root-level artifacts (package.json, tsconfig.json, yarn.lock, .next/, node_modules/) — created by mistake.

## Project History
See `dev-docs/CHANGELOG.md` for session notes and decisions.

## TODO Tracking
- Todo file: `dev-docs/TODO.md`
- Format ima tri tipe vnosov:
  - **Komponente/refaktoring** — opis + seznam fajlov ki jih treba posodobiti
  - **Open questions** — nejasnosti ki potrebujejo odgovor pred implementacijo
  - **Task Table** — status overview (`todo` / `in-progress` / `done`)
- Ko najdeš bug, tech debt ali odprto vprašanje → dodaj v pravi sekcijo
- Ko začneš task → status na `in-progress`
- Ko končaš → status na `done`, ne briši vrstice
- Nove komponente dokumentiraj kot `FormAlert` — kaj zamenjuje, kje že implementirano, kje še treba

