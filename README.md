# FAsset User UI

## Prerequisites
1. Working version of fasset minting backend.

## Run with docker
1. Move to `/src` folder.
2. Copy `.env.example` to `.env` and fill the values.
3. Move to `/docker` folder.
4. Pull the image with `docker compose --env-file ../src/.env pull`.
5. Run with `sudo docker compose --env-file ../src/.env up` or in detached mode `sudo docker compose --env-file ../src/.env up -d`

## Updating new versions
1. Pull with `git pull`.
3. Move to `/docker` folder.
4. Pull the image with `docker compose --env-file ../src/.env pull`.
5. Run with `sudo docker compose --env-file ../src/.env up` or in detached mode `sudo docker compose --env-file ../src/.env up -d`


Next.js frontend for the FAsset protocol — lets users mint, redeem, and bridge synthetic assets (FXRP, FBTC, FDOGE) between Flare/Songbird and native chains (XRP, BTC, DOGE).

---

## Tech Stack

**Next.js 14 (Pages Router)** — not App Router. The project predates stable App Router and relies on `_app.tsx`/`_document.tsx` patterns, `next/router`, and Next's built-in i18n routing. Don't migrate unless you plan to touch everything.

**Mantine v7** for all UI components. Provides the form primitives (`useForm`), modal manager, notification system, and theming. We use `mantine-form-yup-resolver` to wire Yup schemas directly into Mantine forms — this is the established pattern, don't reach for React Hook Form or Formik.

**ethers.js v6** for EVM contract interactions. All contract calls go through `useContracts.ts` as `useMutation` hooks via React Query. If you're adding a new contract interaction, that's where it lives.

**React Query v5** for server state. Mutations for contract calls, queries for API data. No Redux, no Context for server state.

**Zustand** for lightweight client state (selected coin, network, wallet connection state).

**LayerZero + xrpl** for cross-chain bridging. The bridge supports three path types: `HYPER_EVM`, `HYPER_CORE`, `FLARE`, and `XRPL`. These are defined in `constants.ts` and drive the bridge form logic.

**Ledger + WalletConnect + Xaman (XUMM)** as wallet connectors. Each has its own connector class in `connectors/`. Ledger requires WebHID, which only works in Chromium-based browsers.

---

## Project Structure

```
src/                    ← Next.js root, all commands run from here
├── pages/              ← Routes: mint, bridge, tags, pools, connect
├── components/         ← UI components, grouped by feature
├── hooks/
│   ├── useContracts.ts ← All EVM contract mutations (single source of truth)
│   ├── useWeb3.tsx     ← Wallet connection, chain switching, signer
│   └── useNetworks.ts  ← Active network/chain resolution
├── api/                ← Axios API clients (one file per domain)
├── connectors/         ← Wallet connector classes (MetaMask, WalletConnect, Ledger, Xaman)
├── store/              ← Zustand stores (coin selection, etc.)
├── config/
│   ├── networks.tsx    ← Chain configs per environment
│   ├── theme.ts        ← Mantine theme overrides
│   └── i18n.ts         ← i18next setup
├── languages/en.json   ← All translation keys
├── constants.ts        ← Bridge types, ABI error codes, BIP44 paths, wallet names
├── types.ts            ← Shared TypeScript types
├── utils.ts            ← toLots/fromLots, formatAmount, parseUnits helpers
└── abi.ts              ← All contract ABIs in one file
```

Key non-obvious files:
- `utils.ts` — `toLots()` / `fromLots()` convert between human amounts and lots (1 lot = lotSize tokens, e.g. 10 FXRP). Always use these; never manually divide.
- `constants.ts` — `ABI_ERRORS` maps 4-byte selectors to readable error names. Used by `ethers-decode-error` for user-facing error messages.
- `dev-docs/HELP.md` — contract function signatures, event parameters, and flow steps. Read before touching mint/redeem logic.
- `dev-docs/DOMAIN.md` — domain knowledge (collateral ratios, lots, minting flow). Read before implementing anything protocol-related.

---

## Scripts

All commands must be run from `src/`, not the repo root.

```bash
# Development
cd src && npm run dev       # Start dev server on :3000

# Production
cd src && npm run build     # Build (standalone output, used in Docker)
cd src && npm run start     # Start production server

# Quality
cd src && npm run lint      # ESLint via next lint
```

> Do not run `next build` from the repo root to check types — it creates stale artifacts at the wrong level. To verify types locally, start the dev server and watch for TS errors, or ask someone to run it.

---

## Environment Variables

Copy `.env.example` to `.env` inside `src/`:

```bash
cp src/.env.example src/.env
```

Key variables to set:

| Variable | Notes |
|---|---|
| `WALLETCONNECT_PROJECT_ID` | Get from [cloud.walletconnect.com](https://cloud.walletconnect.com/app) or Flare FAssets Telegram |
| `API_URL` | Backend API base URL |
| `NETWORK` | `mainnet` or `testnet` |
| `MAINNET_CHAIN` | `FLR` or `SGB` |
| `TESTNET_CHAIN` | `C2FLR` or `CFLR` |
| `ENABLED_UNDERLYING_FASSETS` | Comma-separated: `FXRP`, `FTestXRP`, `FBTC`, `FDOGE` |
| `ENABLED_WALLETS` | Comma-separated: `WalletConnect`, `MetaMask`, `Ledger`, `Xaman` |
| `XAMAN_API_KEY` | Required if Xaman wallet is enabled |
| Bridge addresses | `BRIDGE_FXRP_ADDRESS`, `BRIDGE_FXRP_OFT_ADAPTER_ADDRESS`, etc. — get from protocol team |

Env vars are inlined at build time via `next.config.mjs`. There is no runtime env injection — rebuilding the image is required to change env values in production.

---

## Docker

Two Docker setups exist:

**`src/compose.yaml`** — uses the pre-built image from `ghcr.io/acex-si/fasset-user-ui:master`. Requires a `frontend.env` file next to the compose file.

```bash
# from src/
cp .env.example frontend.env
# edit frontend.env
docker compose up -d
```

**`docker/docker-compose.yml`** — builds from source using `docker/Dockerfile`.

```bash
# from repo root
docker compose -f docker/docker-compose.yml up --build
```

The production image uses Next.js standalone output (`output: "standalone"` in `next.config.mjs`) — only `server.js`, `public/`, and `.next/static/` are included in the runner stage.

---

## Package Manager

npm (uses `package-lock.json`). The Dockerfile runs `npm ci` — keep the lockfile committed and don't mix package managers. There's no particular reason to prefer npm over pnpm here; it's what the project started with and the lockfile is committed.

---

## Debugging

**Ledger not connecting:** WebHID is Chromium-only. Test in Chrome or Brave. Also requires HTTPS in production — won't work on plain HTTP.

**Contract errors showing hex codes:** `constants.ts` has an `ABI_ERRORS` map. If you see an unknown 4-byte selector, add it there. The `ethers-decode-error` library uses this to show readable messages.

**`POOLS_ENABLED=false`** in env will redirect `/pools` to `/404` at the Next.js routing level — this is intentional for environments where pools aren't live yet.

**Multiple network URLs** (`FLR_URL`, `SGB_URL`, `CFLR_URL`, `C2FLR_URL`) let the same build serve different chains depending on which URL users land on. The active chain is resolved in `useNetworks.ts`.

---

## Useful Links

- Coston2 app (testnet - COSTON2): https://fasset-coston2.matheo.si/
- API Swagger (testnet - COSTON2): https://fasset-coston2.matheo.si/api-doc
- FAsset protocol docs: `dev-docs/HELP.md` (contract functions, events, flows)
- Domain overview: `dev-docs/DOMAIN.md`
- Product spec: `docs/PRODUCT.md`
- Technical spec: `docs/DEV_SPEC.md`
- WalletConnect dashboard: https://cloud.walletconnect.com/app
