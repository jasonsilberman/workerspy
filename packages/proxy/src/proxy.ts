import { Proxies } from "@workerspy/core/proxies/index";
import { Requests } from "@workerspy/core/requests/index";
import { parseBody } from "./utils/body";

const mergeUrls = (incoming: URL, target: URL) => {
	const normalizedTargetPath = target.pathname.endsWith("/")
		? target.pathname.slice(0, -1)
		: target.pathname;
	const normalizedIncomingPath = incoming.pathname.startsWith("/")
		? incoming.pathname
		: `/${incoming.pathname}`;
	const mergedPathname = normalizedTargetPath + normalizedIncomingPath;

	const mergedSearchParams = new URLSearchParams(target.search);
	const incomingSearchParams = new URLSearchParams(incoming.search);
	for (const [key, value] of incomingSearchParams) {
		mergedSearchParams.append(key, value);
	}
	const mergedSearch = mergedSearchParams.toString()
		? `?${mergedSearchParams.toString()}`
		: "";

	return new URL(mergedPathname + mergedSearch, target.origin);
};

export const recordProxiedRequest = async (params: {
	proxyId: string;
	request: Request;
	response: Response;
	durationMs: number;
}) => {
	const { proxyId, request, response, durationMs } = params;

	const clientIp =
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-forwarded-for") ??
		"unknown";

	const url = new URL(response.url);

	const requestBody = await parseBody(request);
	const responseBody = await parseBody(response);

	return Requests.createRequest({
		proxyId,
		url: url.toString(),
		clientIp,
		durationMs,

		requestMethod: request.method,
		requestHeaders: Object.fromEntries(request.headers.entries()),
		requestBodyType: requestBody.type,
		requestBodyText: requestBody.text,
		requestBodyJson: requestBody.json,
		requestBodyRaw: requestBody.blob,

		responseStatus: response.status,
		responseHeaders: Object.fromEntries(response.headers.entries()),
		responseBodyType: responseBody.type,
		responseBodyText: responseBody.text,
		responseBodyJson: responseBody.json,
		responseBodyRaw: responseBody.blob,
	});
};

export const processProxyRequest = async (
	request: Request,
	env: Env,
	ctx: ExecutionContext,
) => {
	const url = new URL(request.url);

	const [proxyId] = url.host.split(".");

	const proxy = await Proxies.getProxy(proxyId);

	if (!proxy) {
		return new Response("Proxy not found", { status: 404 });
	}

	const targetUrl = new URL(proxy.target);

	const mergedUrl = mergeUrls(url, targetUrl);

	const start = performance.now();

	const clonedRequest = request.clone();

	const response = await fetch(mergedUrl, clonedRequest);

	ctx.waitUntil(
		recordProxiedRequest({
			proxyId,
			request,
			response,
			durationMs: performance.now() - start,
		}),
	);

	return response;
};
