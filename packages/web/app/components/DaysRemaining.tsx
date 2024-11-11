import { PROXY_LINK_EXPIRY_DAYS } from "@workerspy/core/proxies/constants";
import { useEffect, useState } from "react";
import { getDaysRemaining } from "~/lib/date";

export function DaysRemaining({ createdAt }: { createdAt: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p>&nbsp;</p>;
  }

  const daysRemaining = getDaysRemaining(
    new Date(createdAt),
    PROXY_LINK_EXPIRY_DAYS,
  );

  return <p>Link valid for {daysRemaining} more days</p>;
}
