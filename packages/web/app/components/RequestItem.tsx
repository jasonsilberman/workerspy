import type { SelectRequest } from "@workerspy/core/requests/requests.sql";
import { formatDateTime } from "~/lib/date";
import { Body } from "./Body";
import { Headers } from "./Headers";

export function RequestItem({ request }: { request: SelectRequest }) {
  return (
    <div className="transition-colors border border-amber-300">
      <details>
        <summary className="p-3 cursor-pointer flex justify-between items-center hover:bg-amber-100">
          <div className="flex items-center gap-4">
            <span
              className={`font-mono ${getStatusColor(request.responseStatus)}`}
            >
              {request.responseStatus}
            </span>
            <span className="text-gray-900">{request.requestMethod}</span>
            <span className="font-medium text-gray-900">{request.url}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-800">
            <span>{request.durationMs}ms</span>
            <time>{formatDateTime(request.createdAt)}</time>
          </div>
        </summary>

        <div className="p-3 border-t border-amber-300">
          <div className="mb-3 flex gap-4 text-sm text-gray-800">
            <div>
              <span className="font-medium">Client IP:</span> {request.clientIp}
            </div>
            <div>
              <span className="font-medium">Duration:</span>{" "}
              {request.durationMs}ms
            </div>
            <div>
              <span className="font-medium">Timestamp:</span>{" "}
              {formatDateTime(request.createdAt)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <section>
              <h3 className="font-semibold mb-2">Request</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Headers
                  </h4>
                  <Headers headers={request.requestHeaders} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Body
                  </h4>
                  <Body
                    type={request.requestBodyType}
                    raw={request.requestBodyRaw}
                    text={request.requestBodyText}
                    json={request.requestBodyJson}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Response</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Headers
                  </h4>
                  <Headers headers={request.responseHeaders} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Body
                  </h4>
                  <Body
                    type={request.responseBodyType}
                    raw={request.responseBodyRaw}
                    text={request.responseBodyText}
                    json={request.responseBodyJson}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </details>
    </div>
  );
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-green-600";
  if (status >= 300 && status < 400) return "text-blue-600";
  if (status >= 400 && status < 500) return "text-yellow-600";
  return "text-red-600";
}
