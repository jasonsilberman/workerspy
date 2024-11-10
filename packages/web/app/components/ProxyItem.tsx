import { Link } from "@remix-run/react";
import type { SelectProxy } from "@workerspy/core/proxies/proxies.sql";
import { CopyableLink } from "./CopyableLink";

interface ProxyItemProps {
	proxy: SelectProxy & { requestsCount: number };
	proxyHostRoot: string;
}

export function ProxyItem({ proxy, proxyHostRoot }: ProxyItemProps) {
	const proxyUrl = `${proxy.id}.${proxyHostRoot}`;

	return (
		<div className="p-4 border rounded-lg space-y-2">
			<div className="flex items-center justify-between">
				<CopyableLink href={proxyUrl} />

				<span className="text-gray-600">
					{proxy.requestsCount} request{proxy.requestsCount !== 1 ? "s" : ""}
				</span>
			</div>
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">{proxy.target}</h2>

				<Link
					to={`/proxy/${proxy.id}`}
					className="text-blue-500 hover:text-blue-600"
				>
					View Details →
				</Link>
			</div>
		</div>
	);
}
