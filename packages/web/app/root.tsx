import type { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import "./tailwind.css";

export const links: LinksFunction = () => [];

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
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
