import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Analytics } from "../../../core/src/analytics";

export async function loader({ context }: LoaderFunctionArgs) {
  const auth = {
    accountId: context.cloudflare.env.ACCOUNT_ID,
    token: context.cloudflare.env.ANALYTICS_ACCOUNT_TOKEN,
  };

  const analytics = await Analytics.getAll(auth, "workerspy_requests");

  return { analytics };
}

export default function AnalyticsRoute() {
  const { analytics } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Analytics</h1>
      <pre>{JSON.stringify(analytics, null, 2)}</pre>
    </div>
  );
}
