import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { useDb } from "../db/client";
import { requestsTable } from "../requests/requests.sql";
import { type InsertProxy, proxiesTable } from "./proxies.sql";

export namespace Proxies {
	export function getProxies() {
		return useDb()
			.select()
			.from(proxiesTable)
			.orderBy(desc(proxiesTable.createdAt));
	}

	export async function getProxiesWithCount() {
		const proxiesWithCount = await useDb()
			.select({
				...getTableColumns(proxiesTable),
				requestsCount: count(requestsTable.id),
			})
			.from(proxiesTable)
			.orderBy(desc(proxiesTable.createdAt))
			.leftJoin(requestsTable, eq(requestsTable.proxyId, proxiesTable.id))
			.groupBy(proxiesTable.id, proxiesTable.target, proxiesTable.createdAt);

		return proxiesWithCount;
	}

	export function getProxy(proxyId: string) {
		return useDb()
			.select()
			.from(proxiesTable)
			.where(eq(proxiesTable.id, proxyId))
			.get();
	}

	export async function createProxy(proxy: InsertProxy) {
		const [result] = await useDb()
			.insert(proxiesTable)
			.values(proxy)
			.returning();
		return result;
	}
}
