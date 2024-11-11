import { PROXY_LINK_EXPIRY_DAYS } from "./constants";
import type { SelectProxy } from "./proxies.sql";

export function isProxyExpired(proxy: Pick<SelectProxy, "createdAt">): boolean {
  const expiresAt = new Date(
    new Date(proxy.createdAt).getTime() +
      PROXY_LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );
  return Date.now() > expiresAt.getTime();
}

export function getDaysUntilDataDeletion(
  proxy: Pick<SelectProxy, "createdAt">,
): number {
  const deletionDate = new Date(
    new Date(proxy.createdAt).getTime() +
      PROXY_LINK_EXPIRY_DAYS * 2 * 24 * 60 * 60 * 1000,
  );
  return Math.ceil(
    (deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}
