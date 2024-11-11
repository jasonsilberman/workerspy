import { and, count, desc, eq, getTableColumns, isNull } from "drizzle-orm";
import { useDb } from "../db/client";
import { requestsTable } from "../requests/requests.sql";
import { PROXY_LINK_EXPIRY_DAYS } from "./constants";
import { type InsertProxy, proxiesTable } from "./proxies.sql";

export namespace Proxies {
  export function getProxies() {
    return useDb()
      .select()
      .from(proxiesTable)
      .where(isNull(proxiesTable.deletedAt))
      .orderBy(desc(proxiesTable.createdAt));
  }

  export async function getProxiesWithCount() {
    const proxiesWithCount = await useDb()
      .select({
        ...getTableColumns(proxiesTable),
        requestsCount: count(requestsTable.id),
      })
      .from(proxiesTable)
      .where(isNull(proxiesTable.deletedAt))
      .orderBy(desc(proxiesTable.createdAt))
      .leftJoin(requestsTable, eq(requestsTable.proxyId, proxiesTable.id))
      .groupBy(proxiesTable.id, proxiesTable.target, proxiesTable.createdAt);

    return proxiesWithCount;
  }

  export function getProxyTargetInternal(proxyId: string) {
    return useDb()
      .select({
        target: proxiesTable.target,
        createdAt: proxiesTable.createdAt,
      })
      .from(proxiesTable)
      .where(and(eq(proxiesTable.id, proxyId), isNull(proxiesTable.deletedAt)))
      .get();
  }

  export function getProxy(proxyId: string, token: string) {
    return useDb()
      .select()
      .from(proxiesTable)
      .where(
        and(
          eq(proxiesTable.id, proxyId),
          eq(proxiesTable.token, token),
          isNull(proxiesTable.deletedAt),
        ),
      )
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
