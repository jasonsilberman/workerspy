import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { DbContext, createDb } from "@workerspy/core/db/client";
import { Proxies } from "@workerspy/core/proxies/index";
import { TightLayout } from "~/components/TightLayout";

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const target = formData.get("target")?.toString();

  if (!target) {
    return { errors: { target: "Target URL is required" } };
  }

  try {
    // Validate URL
    const url = new URL(target);
    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        errors: { target: "Target URL must use HTTP or HTTPS protocol" },
      };
    }
  } catch {
    return { errors: { target: "Invalid URL format" } };
  }

  const db = createDb(context.cloudflare.env.PROXY_DB);
  const proxy = await DbContext.with(db, () => Proxies.createProxy({ target }));

  return redirect(`/proxy/${proxy.id}/${proxy.token}`);
}

export default function NewProxy() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <TightLayout>
      <h1 className="text-3xl">
        <a href="/" className="hover:text-amber-800">
          WorkerSpy
        </a>
      </h1>
      <p>
        Enter the URL you want to proxy requests to. All requests will be logged
        and viewable.
      </p>

      <Form method="post" className="space-y-6">
        <div>
          <label htmlFor="target" className="block text-lg mb-2">
            Target URL
          </label>
          <input
            type="url"
            id="target"
            name="target"
            required
            className="w-full px-4 py-2 bg-amber-50 border-2 border-amber-950 
            focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            placeholder="https://api.example.com"
            disabled={isSubmitting}
          />
          {actionData?.errors?.target && (
            <p className="mt-2 text-red-600">{actionData.errors.target}</p>
          )}
        </div>

        <div className="bg-amber-200 p-4">
          <strong className="block mb-2">Remember:</strong>
          <ul className="list-disc pl-4 space-y-2">
            <li>All request and response data will be logged</li>
            <li>
              Don't use with sensitive information or authentication tokens
            </li>
            <li>This tool is for development and debugging only</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="border-2 border-amber-950 px-6 py-2 hover:bg-amber-950 hover:text-white disabled:opacity-50 disabled:cursor-progress"
        >
          Create Proxy →
        </button>
      </Form>
    </TightLayout>
  );
}
