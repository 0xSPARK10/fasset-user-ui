---
doc_version: "1.3"
app_version: "v1.3"
last_updated: "2026-04-21"
---

# FAsset User UI — Business Rules & Edge Cases

> Sem spadajo stvari ki smo jih ugotovili sproti — edge case-i, omejitve, odločitve in zakaj.
> Ni tehnični spec (za to je `DEV_SPEC.md`) in ni domain glossary (za to je `dev-docs/DOMAIN.md`).
> Format: kratko pravilo + zakaj + kje v kodi.

---

## Minting

### Mint destination: tag vs memo encoding

Pri XRPL direct mintingu ima uporabnik dva načina vnosa destinacije:

1. **Address mode** — user vpiše XRPL naslov ročno
2. **Tag mode** — user vpiše tag številko, sistem razreši naslov prek API-ja

Prioriteta pri izbiri kako se pošlje transakcija (v `ConfirmStepper`):
1. **Tag mode** → pošlje se `DestinationTag` (= user-vneseni tag)
2. **Address mode + addressTag** → pošlje se `DestinationTag` (= auto-fetched tag za default naslov ob odprtju modala)
3. **Address mode brez taga** → zakodira se naslov kot `paymentReference` (direct minting memo)

`addressTag` se auto-fetcha samo enkrat ob odprtju modala za `mainToken.address`. Če user v address mode vpiše drug naslov, se `addressTag` počisti → fallback na memo encoding. Tag se ne re-fetcha med tipkanjem.

**Zakaj:** re-fetch taga ob vsakem keystroke bi bil nepotreben network overhead; memo encoding je varen fallback za naslove brez registriranega taga.

**Koda:** `src/components/mint/ConfirmStepper.tsx` (logika izbire), `src/components/forms/MintForm.tsx` (tag fetch + watch), `src/components/forms/MintDestinationEditor.tsx` (UI)

### addressTag mora biti filtriran po mintingRecipient

`addressTag` (auto-fetched XRPL destination tag) se sme prikazati ali uporabiti **samo za naslov, za katerega je bil pridobljen** — tj. za `mintingRecipient` ki je bil aktiven ob fetchanju.

Če user vpiše drug naslov v address mode, se `addressTag` takoj počisti (`undefined`). S tem se prepreči napačen prikaz taga (tag od starega naslova bi se prikazal ob novem naslovu) in napačno kodiranje transakcije (stari tag bi se poslal na drug naslov).

**Zakaj:** `addressTag` je vezan na specifičen XRPL naslov — tag drugega naslova je neveljaven in potencialno nevaren (sredstva bi šla na napačen račun pri ponudniku). Počistitev ob spremembi naslova je edini varen pristop.

**Koda:** `src/components/forms/MintForm.tsx` (watch na `mintingRecipient`, počistitev `addressTag` ob spremembi)

---

## Redemption

### depositAuth check is scoped to the entered destination address

`depositAuth: true` on an XRPL account blocks incoming payments. The UI checks this flag **only for the address the user has typed** in the destination field — not globally.

When the user changes the destination address, the check re-runs for the new address. An address with `depositAuth` gets an error; the user cannot submit until they provide a different address.

**Zakaj:** Blocking redemption based on any unrelated address would be incorrect. The check must be specific to where the XRP is actually going.

**Koda:** `src/components/redeem/RedeemModal.tsx` (`isDepositAuthBlocking`), `src/components/forms/RedeemForm.tsx` (`onDestinationAddressChange`)

---

## Bridge (LayerZero / XRPL)

### BridgeXrplForm enforces queue max cap as UI limit

When bridging to XRPL, the user's input amount is capped to `Math.min(affordableBalance, queueMaxAmount)` where `queueMaxAmount` comes from `IRedemptionQueue.maxAmountXRP`.

This prevents the user from entering an amount that would trigger a partial redemption on the destination side.

**Zakaj:** The redemption queue has a per-transaction cap. Exceeding it causes incomplete redemptions. Capping in the UI avoids the failure entirely.

**Koda:** `src/components/bridge/BridgeXrplForm.tsx` (amount capping logic)

---

## Smart Accounts

---

## Collateral Pools

---

## Fees & Amounts

---

## XRPL Specifike

---

## Splošno / UI

