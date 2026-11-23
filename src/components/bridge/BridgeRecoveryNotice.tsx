import React, { useRef, useState } from "react";
import Link from "next/link";
import { Grid, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Trans, useTranslation } from "react-i18next";
import { uniqBy } from "lodash-es";
import { useWeb3 } from "@/hooks/useWeb3";
import { IRedeemerBalance, isOftHistoryItem, useFullHistory, useRedeemerAccount } from "@/api/oft";
import { SMART_ACCOUNTS_WEBSITE_URL } from "@/constants";
import { COINS, FASSET_COIN } from "@/config/coin";
import { IOFTHistory } from "@/types";
import { toNumber } from "@/utils";
import { useDirectMintRecoveryStore } from "@/store/directMintRecovery";
import RecoveryNotice from "@/components/bridge/RecoveryNotice";
import { BRIDGE_FORM_COL_STYLE, BRIDGE_WIDE_QUERY } from "@/components/bridge/layout";
import RedeemerWithdrawModal from "@/components/modals/RedeemerWithdrawModal";
import DirectMintRecoveryModal from "@/components/bridge/submit/DirectMintRecoveryModal";
import FXrpFlareIcon from "@/components/icons/FXrpFlareIcon";
import FAssetButton from "@/components/elements/FAssetButton";

// Smaller leftovers are dust, not worth a transfer
const MIN_DISPLAY_BALANCE = 0.01;

const xrplHashOf = (item: IOFTHistory) => item.xrplTxHash ?? item.txhash;

/**
 * Recovery notices above the bridge form:
 * - Asset Recovery — a bridge → XRPL redeem failed on Flare and the funds stayed on the user's
 *   redeemer (bridge) account; one box per token, "Transfer" → RedeemerWithdrawModal.
 * - Mint & Bridge recovery — a direct mint & bridge in AWAITING_RECOVERY (or RECOVERY_PENDING, paid); one box per
 *   stuck XRP payment (each needs its own recovery payment), "Recover" → DirectMintRecoveryModal.
 * Both at chain-picker width (the page grid's columns), Mint & Bridge below Asset Recovery.
 */
export default function BridgeRecoveryNotice({ className = "" }: { className?: string }) {
    const { t } = useTranslation();
    const { mainToken, getConnectedCoin } = useWeb3();
    const [isWithdrawModalActive, setIsWithdrawModalActive] = useState<boolean>(false);
    const activeToken = useRef<IRedeemerBalance>();
    // Original XRPL hash of the stuck direct mint & bridge being recovered
    const [recoveryXrplTxHash, setRecoveryXrplTxHash] = useState<string>();
    const sentRecoveries = useDirectMintRecoveryStore(state => state.sent);
    const isWide = useMediaQuery(BRIDGE_WIDE_QUERY);

    const address = mainToken?.address ?? "";
    const redeemerAccount = useRedeemerAccount(address, !!address);

    // Same query (and key) as "Latest transactions" — one request, refreshed by the table.
    // TEMP: the history covers the last 7 days only; a longer-stuck payment needs its own
    // endpoint (asked Jurij)
    const xrpAddress = FASSET_COIN ? getConnectedCoin(FASSET_COIN.type)?.address : undefined;
    const fullHistory = useFullHistory(address, address !== "", xrpAddress);

    const redeemerAddress = redeemerAccount.data?.address ?? "";
    const balances = (redeemerAccount.data?.balances ?? [])
        .filter(balance => toNumber(balance.balance) >= MIN_DISPLAY_BALANCE);
    // Direct mint & bridge rows come only with an XRPL wallet (`xrpAddress`)
    const stuckMints = xrpAddress
        ? uniqBy(
            (fullHistory.data ?? [])
                .filter(isOftHistoryItem)
                .filter(item => item.action.toUpperCase() === "DIRECT_MINT_BRIDGE" && (item.directMintingStatus === "AWAITING_RECOVERY" || item.directMintingStatus === "RECOVERY_PENDING")),
            xrplHashOf,
        )
        : [];

    const hasAssetRecovery = !!address && balances.length > 0;
    const hasMintRecovery = stuckMints.length > 0;

    return (
        <>
            {(hasAssetRecovery || hasMintRecovery) &&
            // Same columns as the page grid: as wide as the chain picker, with the form's column empty
            <Grid gutter="xl" className={className}>
                <Grid.Col span={isWide ? "auto" : 12}>
                    <div className="flex flex-col gap-8">
                        {hasAssetRecovery &&
                            <RecoveryNotice
                                header={<>
                                    <Text span inherit fw={500}>{t("bridge_page.asset_recovery_title")}</Text>
                                    {" "}
                                    {t("bridge_page.asset_recovery_description")}
                                </>}
                                items={balances.map(balance => {
                                    const coin = COINS.find(c => c.type === balance.symbol);
                                    return {
                                        key: balance.symbol,
                                        // The FAsset sits on Flare here — the icon with the Flare badge, as in the picker
                                        icon: coin?.isFAssetCoin
                                            ? <FXrpFlareIcon width="36" height="36" className="flex-shrink-0" />
                                            : coin?.icon?.({ width: "36", height: "36" }),
                                        symbol: balance.symbol,
                                        amount: balance.balance,
                                        action: <FAssetButton
                                            variant="secondary"
                                            onClick={() => {
                                                activeToken.current = balance;
                                                setIsWithdrawModalActive(true);
                                            }}
                                        >
                                            {t("bridge_page.asset_recovery_transfer_button")}
                                        </FAssetButton>,
                                    };
                                })}
                            />
                        }
                        {hasMintRecovery &&
                            <RecoveryNotice
                                // Figma 5334:89516 — the whole line Medium; "FSA app" dark + underlined.
                                // The tag is <fsa>, not <link>: react-i18next parses <link> as a void HTML element
                                header={
                                    <Text span inherit fw={500}>
                                        <Trans
                                            i18nKey="bridge_page.mint_recovery_description"
                                            values={{ fAsset: FASSET_COIN?.type }}
                                            components={{
                                                fsa: <Link
                                                    href={SMART_ACCOUNTS_WEBSITE_URL}
                                                    target="_blank"
                                                    className="inline-flex items-center underline text-[var(--flr-shark)]"
                                                />,
                                                icon: <IconArrowUpRight size={23} stroke={1.5} color="var(--flr-shark)" className="flex-shrink-0" />,
                                            }}
                                        />
                                    </Text>
                                }
                                items={stuckMints.map(item => ({
                                    key: xrplHashOf(item),
                                    icon: <FXrpFlareIcon width="36" height="36" className="flex-shrink-0" />,
                                    symbol: item.fasset,
                                    amount: item.amount,
                                    // Paid: the backend says so, or this browser sent it moments ago
                                action: item.directMintingStatus === "RECOVERY_PENDING" || sentRecoveries[xrplHashOf(item)]
                                        ? <Text c="var(--flr-gray)" className="text-12" fw={400}>
                                            {t("latest_transactions_card.recovering_label")}
                                        </Text>
                                        : <FAssetButton
                                            variant="secondary"
                                            onClick={() => setRecoveryXrplTxHash(xrplHashOf(item))}
                                        >
                                            {t("latest_transactions_card.recover_button")}
                                        </FAssetButton>,
                                }))}
                            />
                        }
                    </div>
                </Grid.Col>
                {isWide && <Grid.Col span="content" style={BRIDGE_FORM_COL_STYLE} />}
            </Grid>
            }
            {/* Outside the notice: a finished transfer empties the redeemer account and hides the
                notice, while the modal still shows its "Finished" step */}
            <RedeemerWithdrawModal
                opened={isWithdrawModalActive}
                onClose={() => {
                    activeToken.current = undefined;
                    setIsWithdrawModalActive(false);
                }}
                token={activeToken.current}
                redeemerAddress={redeemerAddress}
            />
            {recoveryXrplTxHash &&
                <DirectMintRecoveryModal
                    xrplTxHash={recoveryXrplTxHash}
                    amount={stuckMints.find(item => xrplHashOf(item) === recoveryXrplTxHash)?.amount}
                    onClose={(isRecovering) => {
                        setRecoveryXrplTxHash(undefined);
                        // The box changes (or disappears) once the backend indexes the recovery
                        if (isRecovering) fullHistory.refetch();
                    }}
                />
            }
        </>
    );
}
