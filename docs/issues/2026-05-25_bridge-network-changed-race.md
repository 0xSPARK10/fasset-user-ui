---
date: 2026-05-25
type: bug
area: bridge
severity: high
status: fixed
---

# Bridge to Hyperliquid fails on second attempt with "network changed: 14 => 999"

## Symptom

When a user opens **Bridge FXRP to Hyperliquid** a second time within the same session, the modal renders an error alert reading:

```
network changed: 14 => 999
```

The error appears on the amount step, before the user clicks **Next**, as soon as a fee quote is requested. The first bridge attempt after a fresh wallet connect succeeds; subsequent attempts fail until the page is fully reloaded or the wallet is reconnected.

Affected flow: `Bridge FXRP → Hyperliquid` (FLR/C2FLR wallet, source chain Flare `14`, destination HyperEVM `999`).

## Reproduction

1. Clear browser cache and connect a fresh Flare wallet via WalletConnect.
2. Open `/bridge` and click **Bridge to HYPE**. Enter an amount and complete the flow.
3. After the modal closes, click **Bridge to HYPE** again.
4. Type any amount.

Expected: cross-chain fee is quoted, **Next** becomes enabled.
Observed: red alert with `network changed: 14 => 999`; **Next** stays disabled.

## Root Cause

`WalletConnectConnector.getSigner(token)` (`src/connectors/WalletConnectConnector.ts:318`) operates on a single shared `UniversalProvider` instance whose `defaultChain` is mutated on every call:

```ts
const getSigner = async (token?: ICoin) => {
    const chainId = (token || mainToken)?.network?.chainId;
    const namespace = (token || mainToken)?.network?.namespace;

    if (namespace && chainId !== universalProvider?.namespaces?.[namespace].defaultChain) {
        universalProvider?.setDefaultChain(`${namespace}:${chainId}`);
    }

    return new ethers.BrowserProvider(universalProvider!).getSigner();
}
```

Two read-only React Query hooks in `src/hooks/useContracts.ts` also routed through this signer:

| Hook | What it reads | Chain it forced |
|---|---|---|
| `useHyperEVMBalance` | `balanceOf` on the HyperEVM OFT adapter | 999 |
| `useHypeBalance` | Native HYPE balance | 999 |

Both queries refetch in the background:

- 1 second after the bridge modal closes (`src/components/modals/BridgeModal.tsx:163-169`).
- Every 45 seconds via `BALANCE_FETCH_INTERVAL` polling in `src/components/cards/BridgeUnderlyingBalanceCard.tsx:97`.

Each refetch called `setDefaultChain('eip155:999')`, leaving the shared provider pinned to HyperEVM after a completed bridge.

When the user then opened the modal a second time and typed an amount, `useBridgeQouteSend` (`src/hooks/useContracts.ts:743-747`) called `getSigner(undefined)` to use the Flare main token. The sequence that produced the error:

1. `useBridgeQouteSend` calls `setDefaultChain('eip155:14')` and instantiates `BrowserProvider`.
2. `BrowserProvider` performs its initial `eth_chainId` detection → records expected network `14`.
3. A concurrent background refetch (`useHyperEVMBalance` or `useHypeBalance`) calls `setDefaultChain('eip155:999')`.
4. The next request from `BrowserProvider` sees `eth_chainId === 999`. Ethers v6 throws `network changed: 14 => 999` from `abstract-provider.js:579`.

The first attempt succeeded because, immediately after a fresh connect, the periodic poller had not yet fired and the post-close refetch had not yet run. The race only became reproducible after the first bridge completed.

## Fix

Read-only balance queries do not need the wallet signer. The codebase already uses a direct `JsonRpcProvider` for the same pattern in `useRedeemWithTagSupported` (`useContracts.ts:227`), `getFeeData` (`useContracts.ts:91`), and the `feeProvider` inside `useEnterCollateralPool` (`useContracts.ts:350`). Aligning these two hooks with that pattern removes their side effect on `defaultChain`.

**Patch** (applied in `src/hooks/useContracts.ts`):

```ts
export function useHyperEVMBalance(enabled: boolean = true) {
    const { mainToken, bridgeToken } = useWeb3();

    return useQuery({
        queryKey: [CONTRACT_KEY.HYPER_EVM_BALANCE, mainToken?.address!],
        queryFn: async () => {
            if (!mainToken?.address || !bridgeToken?.network?.rpcUrl) return 0;
            const provider = new ethers.JsonRpcProvider(bridgeToken.network.rpcUrl);
            const contract = new ethers.Contract(
                process.env.BRIDGE_HYPE_FXRP_OFT_ADAPTER_ADDRESS!,
                IIFAssetAbi,
                provider,
            );
            return await contract.balanceOf(mainToken.address);
        },
        enabled: enabled && !!mainToken?.address && !!bridgeToken?.network?.rpcUrl,
        staleTime: 10000,
    });
}

export function useHypeBalance(enabled: boolean = true) {
    const { mainToken, bridgeToken } = useWeb3();

    return useQuery({
        queryKey: [CONTRACT_KEY.HYPE_BALANCE, mainToken?.address!],
        queryFn: async () => {
            if (!mainToken?.address || !bridgeToken?.network?.rpcUrl) return 0;
            const provider = new ethers.JsonRpcProvider(bridgeToken.network.rpcUrl);
            return await provider.getBalance(mainToken.address);
        },
        enabled: enabled && !!mainToken?.address && !!bridgeToken?.network?.rpcUrl,
        staleTime: 10000,
    });
}
```

After this change, the only callers of `setDefaultChain` are user-initiated transaction mutations (`useBridgeApprove`, `useBridgeSend`, `useBridgeQouteSend`, …). They are serialized by user interaction and do not race with background polling.

## Why this resolves the issue

| | Pre-fix | Post-fix |
|---|---|---|
| Background callers of `setDefaultChain(999)` | `useHyperEVMBalance`, `useHypeBalance` (45s poll + 1s post-close refetch) | none |
| `useBridgeQouteSend` on chain `14` | races with background poll | runs uncontested |
| First bridge attempt | works (poller has not fired yet) | works |
| Second bridge attempt | fails with `network changed: 14 => 999` | works |

The chain ID `999` in the error matches the HyperEVM chain that the removed callers were forcing — the connection between cause and symptom is not coincidental.

## Verification

Manual test:

1. Clear cache, reconnect Flare wallet.
2. Bridge to HYPE once and let the modal close.
3. Wait the typical interval (≥1 s for the post-close refetch, optionally ≥45 s for the polling refetch) and open the modal again.
4. Enter an amount.

Expected after fix: fee is quoted on every attempt, no `network changed` alert appears. Verified by the user.

## Files changed

- `src/hooks/useContracts.ts` — `useHyperEVMBalance` and `useHypeBalance` rewritten to use `ethers.JsonRpcProvider(bridgeToken.network.rpcUrl)`.

## Residual considerations

- Balance reads now hit the public HyperEVM RPC (`https://rpc.hyperliquid.xyz/evm`) directly from the browser instead of going through the wallet's RPC connection. This is the same endpoint already configured in `HYPERLIQUID_EVM` (`src/config/networks.tsx:189`) with `addRpcMap: true`, so most wallets were already routing through it.
- The fix does not address transactional flows that legitimately need the wallet signer on chain `999` (Bridge to Flare, Bridge to XRPL). Those paths are user-initiated, run serially with user interaction, and do not race with background polling — no symptom has been observed there.
- A longer-term hardening would add a mutex around `WalletConnectConnector.getSigner` so that concurrent callers wanting different chains queue instead of overwriting each other's `defaultChain`. Not required to close this issue, but worth tracking if a similar race surfaces elsewhere.
