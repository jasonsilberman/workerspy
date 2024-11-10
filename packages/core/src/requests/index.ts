import { desc, eq } from "drizzle-orm";
import { useDb } from "../db/client";
import { type InsertRequest, requestsTable } from "./requests.sql";

export namespace Requests {
	export function getRequests(proxyId: string) {
		return useDb()
			.select()
			.from(requestsTable)
			.where(eq(requestsTable.proxyId, proxyId))
			.orderBy(desc(requestsTable.createdAt))
			.execute();
	}

	export async function createRequest(request: InsertRequest) {
		const [result] = await useDb()
			.insert(requestsTable)
			.values(request)
			.returning();

		return result;
	}
}
