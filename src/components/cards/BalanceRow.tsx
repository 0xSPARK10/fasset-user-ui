import { Text } from "@mantine/core";
import React from "react";

interface IBalanceRow {
	icon: React.ReactNode;
	label: React.ReactNode;
	value: React.ReactNode;
	action?: React.ReactNode;
	className?: string;
}

export default function BalanceRow({
	icon,
	label,
	value,
	action,
	className = "mt-2",
}: IBalanceRow) {
	const responsiveStack = action ? "max-[360px]:flex-col" : "";
	return (
		<div
			className={`flex ${responsiveStack} border-t pt-2 w-full ${className}`}
		>
			<div className="flex items-center">
				{icon}
				<div className="ml-3">
					<Text c="var(--flr-gray)" className="text-12" fw={400}>
						{label}
					</Text>
					<Text className="text-14" fw={500}>
						{value}
					</Text>
				</div>
			</div>
			{action && (
				<div className="ml-auto flex items-center gap-[10px] max-[360px]:ml-0 max-[360px]:mt-2">
					{action}
				</div>
			)}
		</div>
	);
}
