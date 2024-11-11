import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import { useDb } from "../db/client";
import { Proxies } from "../proxies";
import { MAX_REQUESTS_STORED } from "../proxies/constants";
import { getDaysUntilDataDeletion } from "../proxies/helpers";
import { type InsertRequest, requestsTable } from "./requests.sql";

export namespace Requests {
  export function getRequests(proxyId: string) {
    return useDb()
      .select()
      .from(requestsTable)
      .where(
        and(
          eq(requestsTable.proxyId, proxyId),
          isNull(requestsTable.deletedAt),
        ),
      )
      .orderBy(desc(requestsTable.createdAt))
      .limit(MAX_REQUESTS_STORED)
      .execute();
  }

  export async function createRequest(request: InsertRequest) {
    const [result] = await useDb()
      .insert(requestsTable)
      .values(request)
      .returning();

    return result;
  }

  export async function cleanupRequestsForProxy(proxyId: string) {
    const proxy = await Proxies.getProxyTargetInternal(proxyId);
    if (!proxy) return;

    const db = useDb();

    const daysUntilDeletion = getDaysUntilDataDeletion(proxy);

    if (daysUntilDeletion <= 0) {
      console.log(`[cleanup:${proxyId}] Hard deleting all requests`);
      // Hard delete all requests if proxy is past deletion date
      await db
        .delete(requestsTable)
        .where(eq(requestsTable.proxyId, proxyId))
        .execute();
      return;
    }

    // Get requests that exceed the limit
    const requests = await db
      .select()
      .from(requestsTable)
      .where(
        and(
          eq(requestsTable.proxyId, proxyId),
          isNull(requestsTable.deletedAt),
        ),
      )
      .orderBy(desc(requestsTable.createdAt))
      .execute();

    if (requests.length > MAX_REQUESTS_STORED) {
      const oldestAllowedDate = requests[MAX_REQUESTS_STORED - 1]?.createdAt;

      if (!oldestAllowedDate) return;

      console.log(
        `[cleanup:${proxyId}] Soft deleting ${requests.length - MAX_REQUESTS_STORED} requests`,
      );

      // Soft delete requests over the limit (older than the cutoff)
      await db
        .update(requestsTable)
        .set({
          deletedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(
          and(
            eq(requestsTable.proxyId, proxyId),
            isNull(requestsTable.deletedAt),
            lt(requestsTable.createdAt, oldestAllowedDate),
          ),
        )
        .execute();
    } else {
      console.log(`[cleanup:${proxyId}] No requests to clean up`);
    }
  }
}
