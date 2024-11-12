import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import "./tailwind.css";

export const links: LinksFunction = () => [];

export const meta: MetaFunction = () => {
  const title = "WorkerSpy - Debug HTTP requests with a simple proxy";
  const description =
    "Create a proxy endpoint and inspect all incoming requests in real-time. Simple, fast, and effective HTTP debugging tool.";
  const imageUrl = "https://workerspy.com/og.png";

  return [
    { title },
    { name: "description", content: description },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },

    // Viewport and charset (recommended to keep these)
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { charSet: "utf-8" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="font-mono min-h-screen flex flex-col bg-amber-50 text-amber-950 selection:bg-amber-950 selection:text-amber-200">
          {children}
          <div className="flex justify-end mb-0 mt-auto p-4">
            <a
              href="https://github.com/jasonsilberman/workerspy/issues/new"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Send feedback
            </a>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
