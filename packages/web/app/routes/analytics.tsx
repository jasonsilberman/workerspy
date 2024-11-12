import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Analytics } from "../../../core/src/analytics";

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = {
    accountId: context.cloudflare.env.ACCOUNT_ID,
    token: context.cloudflare.env.ANALYTICS_ACCOUNT_TOKEN,
  };

  const durations = await Analytics.getProxyDurationTimeSeries(auth, "n3v5rv");
  const statusCodes = await Analytics.getProxyStatusCodeTimeSeries(
    auth,
    "n3v5rv",
  );

  return { durations, statusCodes };
}

export default function AnalyticsRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Analytics</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
