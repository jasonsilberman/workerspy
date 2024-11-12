import { Link } from "@remix-run/react";
import {
  MAX_REQUESTS_STORED,
  PROXY_LINK_EXPIRY_DAYS,
} from "@workerspy/core/proxies/constants";
import { TightLayout } from "~/components/TightLayout";

export default function Index() {
  return (
    <TightLayout>
      <h1 className="text-3xl">
        <a href="/" className="hover:text-amber-800">
          WorkerSpy
        </a>
      </h1>
      <p>
        Debug HTTP requests with a simple proxy. Create a proxy endpoint and
        inspect all incoming requests in real-time. That's it. That's all it
        does.{" "}
        <a
          href="https://github.com/jasonsilberman/workerspy"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          View source
        </a>
        .
      </p>
      <Link
        to="/new"
        className="border-2 border-amber-950 px-6 py-2 hover:bg-amber-950 hover:text-white inline-block"
      >
        Create Proxy →
      </Link>

      <hr className="border-t-2 border-amber-950" />

      <div className="bg-amber-200 p-4">
        <strong className="block mb-2">Security Notice:</strong>
        <p>
          This service logs all request and response data. Do not use it with
          sensitive information, authentication tokens, or private API
          endpoints. This tool is meant for development and debugging only.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl mb-2">How it works</h2>
          <ol className="list-decimal pl-0 space-y-2">
            <li>Create a proxy endpoint for your target URL</li>
            <li>Send requests to your proxy URL instead of the target</li>
            <li>View all requests and responses in real-time</li>
          </ol>
        </div>
        <div>
          <h2 className="text-2xl mb-2">Under the hood</h2>
          <p>
            WorkerSpy uses a Cloudflare Worker that forwards requests to your
            target URL while logging all request and response data for
            inspection. All data is stored in a Cloudflare D1 database.
          </p>
        </div>
        <div>
          <h2 className="text-2xl mb-2">Security</h2>
          <p>
            Each proxy endpoint is protected with a unique token, but all
            request data is logged and viewable by anyone with the URL. Do not
            use for sensitive data or production traffic.
          </p>
        </div>
        <div>
          <h2 className="text-2xl mb-2">Supported features</h2>
          <p>
            All HTTP methods and content types should be supported. If your API
            can handle it, the proxy should be able to handle it.
          </p>
        </div>

        <div>
          <h2 className="text-2xl mb-2">Limits</h2>
          <ul className="list-disc pl-0 space-y-2">
            <li>Request and response bodies are limited to 1MB in size</li>
            <li>
              Request history is limited to the most recent{" "}
              {MAX_REQUESTS_STORED} requests per proxy
            </li>
            <li>
              Binary data in requests and responses may not be properly captured
            </li>
            <li>
              Proxies will expire after {PROXY_LINK_EXPIRY_DAYS} days and their
              data will be deleted after 14 days. However, we will never re-use
              the same url
            </li>
            <li className="italic">
              If it seems like you are abusing the service, we may delete your
              proxies without warning. Feel free to host it yourself.
            </li>
          </ul>
        </div>
      </div>
    </TightLayout>
  );
}
