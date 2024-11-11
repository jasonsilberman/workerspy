import { webSocketIncomingMessageSchema } from "@workerspy/core/api-types";
import { Proxies } from "@workerspy/core/proxies/index";
import type { SelectRequest } from "@workerspy/core/requests/requests.sql";

export async function handleWebSocketRequest(
  request: Request,
  params: string[],
  env: Env,
) {
  // Reject requests that don't require upgrade
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const [proxyId, token] = params;

  const proxy = await Proxies.getProxy(proxyId, token);

  if (!proxy) {
    return new Response("Proxy not found", { status: 404 });
  }

  // each proxy has its own websocket
  const id = env.REQUESTS_WEBSOCKET.idFromName(proxyId);
  const stub = env.REQUESTS_WEBSOCKET.get(id);

  return stub.fetch(request);
}

export async function broadcastRequest(
  env: Env,
  proxyId: string,
  request: SelectRequest,
) {
  const id = env.REQUESTS_WEBSOCKET.idFromName(proxyId);
  const stub = env.REQUESTS_WEBSOCKET.get(id);

  await stub.broadcast(
    JSON.stringify(
      webSocketIncomingMessageSchema.parse({
        type: "request",
        request,
      }),
    ),
  );
}
