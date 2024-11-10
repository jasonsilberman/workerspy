import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { DbContext, createDb } from "@workerspy/core/db/client";
import { Proxies } from "@workerspy/core/proxies/index";
import { useState } from "react";
import { CreateProxyDialog } from "~/components/CreateProxyDialog";
import { Navbar } from "~/components/Navbar";
import { ProxyItem } from "~/components/ProxyItem";

export async function loader({ context }: LoaderFunctionArgs) {
	const db = createDb(context.cloudflare.env.PROXY_DB);
	const proxyHostRoot = context.cloudflare.env.PROXY_HOST_ROOT;

	const proxies = await DbContext.with(db, Proxies.getProxiesWithCount);

	return {
		proxies,
		proxyHostRoot,
	};
}

export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	const target = formData.get("target")?.toString();

	if (!target) {
		throw new Error("Target is required");
	}

	const db = createDb(context.cloudflare.env.PROXY_DB);
	await DbContext.with(db, () => Proxies.createProxy({ target }));

	return null;
}

export default function Index() {
	const data = useLoaderData<typeof loader>();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="container mx-auto px-4 py-10">
				<div className="mb-6">
					<button
						onClick={() => setIsDialogOpen(true)}
						className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
						type="button"
					>
						Create New Proxy
					</button>
				</div>

				<CreateProxyDialog
					isOpen={isDialogOpen}
					onClose={() => setIsDialogOpen(false)}
				/>

				<div className="flex flex-col gap-4">
					{data.proxies.map((proxy) => (
						<ProxyItem
							key={proxy.id}
							proxy={proxy}
							proxyHostRoot={data.proxyHostRoot}
						/>
					))}
				</div>
			</main>
		</div>
	);
}
