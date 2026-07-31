import { Anchor, Text, Title } from "@mantine/core";
import CopyIcon from "@/components/icons/CopyIcon";
import { IconArrowUpRight } from "@tabler/icons-react";
import { truncateString } from "@/utils";

interface ICardHeader {
	title: string;
	address?: string;
	explorerHref?: string;
	explorerLabel: string;
	className?: string;
}

export default function CardHeader({
	title,
	address,
	explorerHref,
	explorerLabel,
	className,
}: ICardHeader) {
	return (
		<div
			className={`flex justify-between items-baseline ${className ?? ""}`}
		>
			<div className="flex flex-col sm:flex-row sm:items-center">
				<Title className="mr-3 text-15" fw={500}>
					{title}
				</Title>
				{address && (
					<div className="flex items-center break-all mr-3">
						<Text className="block text-15" fw={400}>
							{truncateString(address, 8, 8)}
						</Text>
						<CopyIcon text={address} color="#AFAFAF" />
					</div>
				)}
			</div>
			{address && explorerHref && (
				<Anchor
					underline="always"
					href={explorerHref}
					target="_blank"
					className="inline-flex items-center text-12"
					c="var(--flr-black)"
					fw={500}
				>
					{explorerLabel}
					<IconArrowUpRight size={20} className="ml-1 flex-shrink-0" />
				</Anchor>
			)}
		</div>
	);
}
