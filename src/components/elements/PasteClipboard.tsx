import { IconClipboard } from "@tabler/icons-react";
import React from "react";

interface IPasteClipBoard {
	onPaste: (text: string) => void;
}

export default function PasteClipboard({ onPaste }: IPasteClipBoard) {
	return (
		<IconClipboard
			size={18}
			className="cursor-pointer"
			color="var(--flr-black)"
			onClick={async () => {
				try {
					const text = await navigator.clipboard.readText();
					onPaste(text);
				} catch (error: any) {}
			}}
		/>
	);
}
