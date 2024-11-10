import { DbContext, createDb } from "@workerspy/core/db/client";
import { processProxyRequest } from "./proxy";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return DbContext.with(createDb(env.PROXY_DB), () => {
			return processProxyRequest(request, env, ctx);
		});
	},
};
