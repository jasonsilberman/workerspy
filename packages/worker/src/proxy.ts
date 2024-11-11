import { isProxyExpired } from "@workerspy/core/proxies/helpers";
import { Proxies } from "@workerspy/core/proxies/index";
import { Requests } from "@workerspy/core/requests/index";
import { parseBody } from "./utils/body";
import { broadcastRequest } from "./websock";

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
  env: Env;
  proxyId: string;
  request: Request;
  response: Response;
  durationMs: number;
}) => {
  const { proxyId, request, response, durationMs, env } = params;
  let success = false;

  const recordingStart = performance.now();

  try {
    const clientIp =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for") ??
      "unknown";

    const url = new URL(response.url);

    const requestBody = await parseBody(request);
    const responseBody = await parseBody(response);

    const requestData = await Requests.createRequest({
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

    await broadcastRequest(env, proxyId, requestData);
    await Requests.cleanupRequestsForProxy(proxyId);

    success = true;
  } catch (error) {
    console.error("Failed to record proxied request:", error);
    success = false;
  } finally {
    env.ANALYTICS_ENGINE.writeDataPoint({
      indexes: [proxyId],
      blobs: [
        request.method,
        response.status.toString(),
        success ? "success" : "failure",
      ],
      doubles: [durationMs, performance.now() - recordingStart],
    });
  }
};

export const isProxyRequest = (request: Request, env: Env) => {
  const url = new URL(request.url);
  return url.host === env.PROXY_HOST_ROOT;
};

export const processProxyRequest = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) => {
  const url = new URL(request.url);

  const pathParts = url.pathname.split("/").filter(Boolean);
  const proxyId = pathParts[0];

  if (!proxyId) {
    return new Response("Invalid proxy request", { status: 400 });
  }

  const proxy = await Proxies.getProxyTargetInternal(proxyId);

  if (!proxy) {
    return new Response("Proxy not found", { status: 404 });
  }

  if (isProxyExpired(proxy)) {
    return new Response("This proxy has expired", { status: 410 });
  }

  const targetUrl = new URL(proxy.target);

  const incomingUrl = new URL(request.url);
  incomingUrl.pathname = `/${pathParts.slice(1).join("/")}`;

  const mergedUrl = mergeUrls(incomingUrl, targetUrl);

  const start = performance.now();
  const clonedRequest = request.clone();

  const response = await fetch(mergedUrl, {
    ...clonedRequest,
    redirect: "manual",
  });

  ctx.waitUntil(
    recordProxiedRequest({
      env,
      proxyId,
      request,
      response,
      durationMs: performance.now() - start,
    }),
  );

  return response;
};
