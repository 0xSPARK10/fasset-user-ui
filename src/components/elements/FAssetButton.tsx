import { Button, ButtonProps, createPolymorphicComponent } from "@mantine/core";
import { forwardRef } from "react";

export type FAssetButtonVariant = "primary" | "secondary";

interface IFAssetButton extends Omit<ButtonProps, "variant"> {
	// primary = black filled pill (Bridge, Next, OK); secondary = small outline pill (Mint, Redeem, Refresh, Recover)
	variant?: FAssetButtonVariant;
}

const VARIANT_PROPS: Record<FAssetButtonVariant, ButtonProps> = {
	primary: {
		variant: "filled",
		color: "black",
		radius: "xl",
		size: "sm",
		fw: 400,
	},
	secondary: { variant: "gradient", radius: "xl", size: "xs", fw: 400 },
};

// One look per variant everywhere (same API as the Smart Accounts Button). Polymorphic: with
// component={Link} / "a" it takes that element's props (href required, target, …); every other
// Mantine Button prop passes through and can override the variant's defaults
const FAssetButton = createPolymorphicComponent<"button", IFAssetButton>(
	forwardRef<HTMLButtonElement, IFAssetButton>(
		function FAssetButton({ variant = "primary", ...props }, ref) {
			return <Button ref={ref} {...VARIANT_PROPS[variant]} {...props} />;
		},
	),
);

export default FAssetButton;
