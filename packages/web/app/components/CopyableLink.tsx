import { useState } from "react";
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from "react-aria-components";

interface CopyableLinkProps {
	href: string;
	className?: string;
}

export function CopyableLink({ href, className }: CopyableLinkProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<TooltipTrigger>
			<Button
				onPress={handleCopy}
				className={`px-2 py-1 bg-gray-100 rounded font-mono text-sm text-gray-700 hover:bg-gray-200 transition-colors ${className}`}
				type="button"
			>
				{href}
			</Button>
			<Tooltip
				className="
					shadow-lg rounded bg-gray-800 text-white text-xs px-2 py-1
					absolute z-10
					[&[data-placement=top]]:mb-2
					[&[data-placement=bottom]]:mt-2
					[&[data-placement=left]]:mr-2
					[&[data-placement=right]]:ml-2
				"
				placement="top"
			>
				<OverlayArrow
					className="fill-gray-800 absolute [&>svg]:block
						[&[data-placement=top]]:bottom-[-4px]
						[&[data-placement=bottom]]:top-[-4px]
						[&[data-placement=left]]:right-[-4px]
						[&[data-placement=right]]:left-[-4px]
					"
				>
					<svg width={8} height={8} viewBox="0 0 8 8" aria-hidden="true">
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
				{copied ? "Copied!" : "Click to copy"}
			</Tooltip>
		</TooltipTrigger>
	);
}
