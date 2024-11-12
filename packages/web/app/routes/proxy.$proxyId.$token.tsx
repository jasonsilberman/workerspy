import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect, useLoaderData } from "@remix-run/react";
import { Analytics } from "@workerspy/core/analytics/index";
import { webSocketIncomingMessageSchema } from "@workerspy/core/api-types";
import { DbContext, createDb } from "@workerspy/core/db/client";
import { MAX_REQUESTS_STORED } from "@workerspy/core/proxies/constants";
import {
  getDaysUntilDataDeletion,
  isProxyExpired,
} from "@workerspy/core/proxies/helpers";
import { Proxies } from "@workerspy/core/proxies/index";
import { Requests } from "@workerspy/core/requests/index";
import type { SelectRequest } from "@workerspy/core/requests/requests.sql";
import { Fragment, useMemo } from "react";
import { AnalyticsCharts } from "~/components/AnalyticsCharts";
import { Copyable } from "~/components/Copyable";
import { DaysRemaining } from "~/components/DaysRemaining";
import { RequestItem } from "~/components/RequestItem";
import { useWebSocket } from "~/lib/useWebSocket";

export async function loader({ context, params }: LoaderFunctionArgs) {
  const db = createDb(context.cloudflare.env.PROXY_DB);

  const { proxyId, token } = params;

  if (!proxyId || !token) {
    throw redirect("/");
  }

  const auth = {
    accountId: context.cloudflare.env.ACCOUNT_ID,
    token: context.cloudflare.env.ANALYTICS_ACCOUNT_TOKEN,
  };

  // this is so dumb remix doesn't support some sort of middleware
  const [proxy, requests, durationTimeSeries, statusCodeTimeSeries] =
    await DbContext.with(db, () => {
      return Promise.all([
        Proxies.getProxy(proxyId, token),
        Requests.getRequests(proxyId),
        Analytics.getProxyDurationTimeSeries(auth, proxyId),
        Analytics.getProxyStatusCodeTimeSeries(auth, proxyId),
      ]);
    });

  if (!proxy) {
    throw redirect("/");
  }

  const proxyHostRoot = context.cloudflare.env.PROXY_HOST_ROOT;
  const apiHost = context.cloudflare.env.API_HOST;

  return {
    proxy,
    requests,
    proxyHostRoot,
    apiHost,
    durationTimeSeries,
    statusCodeTimeSeries,
  };
}

export default function ProxyDetailPage() {
  const data = useLoaderData<typeof loader>();

  const isExpired = isProxyExpired(data.proxy);

  const { status, messages } = useWebSocket({
    url: `${data.apiHost}/ws/${data.proxy.id}/${data.proxy.token}`,
    incomingMessageSchema: webSocketIncomingMessageSchema,
    enabled: !isExpired,
  });

  const requests = useMemo(() => {
    const requestsFromWebsocket = messages
      .filter((m) => m.type === "request")
      .map((m) => m.request)
      .reverse();

    return [...requestsFromWebsocket, ...data.requests];
  }, [data.requests, messages]);

  const proxyUrl = `https://${data.proxyHostRoot}/${data.proxy.id}`;

  const daysUntilDeletion = getDaysUntilDataDeletion(data.proxy);
  const isDataDeleted = daysUntilDeletion <= 0;

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-full p-6 space-y-6">
        <h1 className="text-3xl">
          <a href="/" className="hover:text-amber-700 transition-colors">
            WorkerSpy
          </a>
        </h1>

        {isExpired && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            This proxy has expired and is no longer accepting new requests.
          </div>
        )}
        <div className="space-y-4 border border-amber-300 p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-800">Proxying to</div>
                <div className="text-xl font-bold text-gray-900">
                  {data.proxy.target}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-800">Accessible at</div>
                <Copyable text={proxyUrl} />
              </div>
            </div>

            {!isExpired && (
              <div className="text-sm text-gray-800 space-y-1 text-right">
                <DaysRemaining createdAt={data.proxy.createdAt} />
                <p>
                  Only storing the most recent {MAX_REQUESTS_STORED} requests
                </p>
              </div>
            )}
          </div>
        </div>

        {!isDataDeleted && (
          <AnalyticsCharts
            durationTimeSeries={data.durationTimeSeries}
            statusCodeTimeSeries={data.statusCodeTimeSeries}
          />
        )}

        <div className="space-y-4">
          {isDataDeleted ? (
            <div className="text-gray-600 px-4 py-3 border border-gray-300">
              Request data has been deleted after the 14-day retention period
              from proxy creation.
            </div>
          ) : (
            <Fragment>
              <div className="flex justify-between text-gray-600 font-mono">
                <div>
                  {requests.length} request
                  {requests.length !== 1 ? "s" : ""}
                  {daysUntilDeletion <= 7 && (
                    <span className="ml-2 text-amber-600">
                      (data will be deleted in {daysUntilDeletion} days)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {status === "CONNECTING" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>connecting to realtime</span>
                    </>
                  )}
                  {status === "OPEN" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span>listening in realtime</span>
                    </>
                  )}
                  {status === "CLOSED" && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>realtime error</span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {requests.map((request) => (
                  <RequestItem
                    key={request.id}
                    request={request as SelectRequest}
                  />
                ))}
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
