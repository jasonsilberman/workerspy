import { DbContext, createDb } from "@workerspy/core/db/client";
import { RequestsWebSocket } from "./do/ws";
import { isProxyRequest, processProxyRequest } from "./proxy";
import { handleErrors } from "./utils/errors";
import { handleWebSocketRequest } from "./websock";

export { RequestsWebSocket };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return await handleErrors(request, async () =>
      DbContext.with(createDb(env.PROXY_DB), () => {
        if (isProxyRequest(request, env)) {
          return processProxyRequest(request, env, ctx);
        }

        const url = new URL(request.url);

        const [path, ...params] = url.pathname.slice(1).split("/");

        if (path === "ws") {
          return handleWebSocketRequest(request, params, env);
        }

        if (path === "healthcheck") {
          return new Response("OK");
        }

        return new Response("Not found", { status: 404 });
      }),
    );
  },
};
