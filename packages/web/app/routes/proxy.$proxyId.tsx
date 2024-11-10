import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Await, Link, redirect, useLoaderData } from "@remix-run/react";
import { DbContext, createDb } from "@workerspy/core/db/client";
import { Proxies } from "@workerspy/core/proxies/index";
import { Requests } from "@workerspy/core/requests/index";
import { Fragment, Suspense } from "react";
import { CopyableLink } from "~/components/CopyableLink";
import { Navbar } from "~/components/Navbar";
import { RequestItem } from "~/components/RequestItem";

export async function loader({ context, params }: LoaderFunctionArgs) {
	const db = createDb(context.cloudflare.env.PROXY_DB);

	const proxyId = params.proxyId;

	if (!proxyId) {
		throw redirect("/");
	}

	// this is so dumb remix doesn't support some sort of middleware
	const { proxyPromise, requestsPromise } = DbContext.with(db, () => {
		const proxyPromise = Proxies.getProxy(proxyId);
		const requestsPromise = Requests.getRequests(proxyId);

		return { proxyPromise, requestsPromise };
	});

	const proxy = await proxyPromise;

	if (!proxy) {
		throw redirect("/");
	}

	const proxyHostRoot = context.cloudflare.env.PROXY_HOST_ROOT;

	return {
		proxy,
		requestsPromise,
		proxyHostRoot,
	};
}

export default function ProxyRequests() {
	const data = useLoaderData<typeof loader>();
	const proxyUrl = `${data.proxyHostRoot}/${data.proxy.id}`;

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="container mx-auto px-4 py-10 flex flex-col gap-4">
				<div className="flex flex-col items-start gap-2">
					<CopyableLink href={proxyUrl} />
					<h2 className="text-2xl font-bold">{data.proxy.target}</h2>
				</div>
				<div className="space-y-4">
					<Suspense>
						<Await resolve={data.requestsPromise}>
							{(requests) => (
								<Fragment>
									<div className="text-gray-600">
										{requests.length} request{requests.length !== 1 ? "s" : ""}
									</div>
									{requests.map((request) => (
										<RequestItem key={request.id} request={request} />
									))}
								</Fragment>
							)}
						</Await>
					</Suspense>
				</div>
			</main>
		</div>
	);
}
