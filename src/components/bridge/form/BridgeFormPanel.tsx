import React from "react";
import { Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { getBridgeRouteChain } from "@/config/bridgeRoutes";
import { FASSET_COIN } from "@/config/coin";
import AmountInput from "@/components/elements/AmountInput";
import BridgeSwapButton from "@/components/bridge/picker/BridgeSwapButton";
import BridgeChainHeading from "@/components/bridge/picker/BridgeChainHeading";
import BridgeSourceSubtitle from "@/components/bridge/picker/BridgeSourceSubtitle";
import BridgeFormFooter from "@/components/bridge/form/BridgeFormFooter";
import { useApplyAmountValidation, useBridgeAmountForm, useBridgeAmountLink } from "@/components/bridge/state/useBridgeAmountForm";
import FormAlert from "@/components/elements/FormAlert";
import { useBridgeRouteQuote } from "@/components/bridge/quotes/useBridgeRouteQuote";
import { useBridgeSubmit } from "@/components/bridge/submit/useBridgeSubmit";
import { BridgeSubmitPayload } from "@/components/bridge/submit/types";
import { IBridgePageState } from "@/components/bridge/state/useBridgePageState";
import { formatReceivedAmount } from "@/components/bridge/utils";

interface IBridgeFormPanel {
	state: IBridgePageState;
	onSubmit: (payload: BridgeSubmitPayload) => void;
	// Full-width row under the picker (narrow desktop) — amount input fixed at the width it has
	// in the 510px panel (half the row there), so it doesn't stretch across the whole row
	stacked?: boolean;
	className?: string;
}

// Right-hand side of the desktop bridge page: amount, received amount, fees and the CTA
// for the picked route.
export default function BridgeFormPanel({ state, onSubmit, stacked, className }: IBridgeFormPanel) {
	const { t } = useTranslation();
	const { from, to, route } = state;
	const fromChain = getBridgeRouteChain(from);
	const toChain = getBridgeRouteChain(to);
	const { form, amount, isTyping } = useBridgeAmountForm(from, to, state.amountResetKey);
	const quote = useBridgeRouteQuote({
		from,
		route,
		amount,
		balances: state.balances,
		destinationAddress: state.recipientAddress,
		destinationTag: state.destinationTag,
	});
	useApplyAmountValidation(form, quote.validation.input, amount, isTyping);
	useBridgeAmountLink(form, quote, state, amount);
	const { canSubmit, isSubmitting, isSending, alert, submit } = useBridgeSubmit({ state, quote, amount, isTyping, onSubmit });

	return (
		<Paper withBorder radius={2} className={className}>
			<div className="relative border-b border-[var(--flr-border-color)] p-6">
				<FormAlert message={alert?.msg} type={alert?.type} />
				{/* Top-aligned + 2px down on the input: centred on the heading block (token line +
				    "N available"), and a validation error under the input doesn't move the heading */}
				<div className="flex items-start gap-2.5">
					<div className="flex-1 min-w-0">
						<BridgeChainHeading
							chain={fromChain}
							subtitle={<BridgeSourceSubtitle hasSourceWallet={state.hasSourceWallet} available={quote.available} limit={quote.limit} />}
						/>
					</div>
					{fromChain && (
						<div className={`mt-0.5 ${stacked ? "w-[226px] flex-shrink-0" : "flex-1"}`}>
							<AmountInput
								form={form}
								variant="inline"
								autoFocus={false}
								fAssetCoin={FASSET_COIN}
								maxAmount={quote.maxAmount}
								allowDecimal={quote.allowDecimal}
								placeholder={quote.validation.input?.placeholder}
								readOnly={quote.validation.input?.readOnly}
								disabled={quote.validation.input?.disabled}
								className=""
							/>
						</div>
					)}
				</div>
				<BridgeSwapButton state={state} isSending={isSending} />
			</div>
			<div className="border-b border-[var(--flr-border-color)] p-6">
				<div className="flex items-center justify-between">
					<BridgeChainHeading chain={toChain} />
					{toChain && (
						<Text className="text-16" c="var(--flr-shark)">
							{formatReceivedAmount(quote.received ?? 0)}
						</Text>
					)}
				</div>
			</div>
			<BridgeFormFooter
				isConnected={state.hasSourceWallet}
				canSubmit={canSubmit}
				isSubmitting={isSubmitting}
				fees={quote.fees}
				hasRoute={!!route}
				onSubmit={() => form.onSubmit(() => submit())()}
			/>
		</Paper>
	);
}
