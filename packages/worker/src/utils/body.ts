import { MAX_BODY_SIZE } from "@workerspy/core/proxies/constants";

const JSON_CONTENT_TYPES = [
  "application/json",
  "application/ld+json",
  "application/vnd.api+json",
];

const TEXT_CONTENT_TYPES = [
  "text/",
  "application/xml",
  "application/javascript",
  "application/ecmascript",
  "application/x-www-form-urlencoded",
];

type BodyData = {
  type: "json" | "text" | "blob" | "none" | "error";
  json?: unknown;
  text?: string;
  blob?: Blob;
};

export async function parseBody(input: Request | Response): Promise<BodyData> {
  try {
    const contentType = input.headers.get("content-type") || "";
    const contentLength = Number.parseInt(
      input.headers.get("content-length") || "0",
      10,
    );

    // Check if body size exceeds limit
    if (contentLength > MAX_BODY_SIZE) {
      return { type: "json" };
    }

    // Check for JSON content types
    if (JSON_CONTENT_TYPES.some((type) => contentType.includes(type))) {
      const json = await input.clone().json();
      return { type: "json", json };
    }

    // Check for text content types
    if (TEXT_CONTENT_TYPES.some((type) => contentType.includes(type))) {
      const text = await input.clone().text();
      return { type: "text", text };
    }

    // Handle blob for all other content types
    const blob = await input.clone().blob();

    if (blob.size === 0) {
      return { type: "none" };
    }

    if (blob.size > MAX_BODY_SIZE) {
      return { type: "blob" };
    }

    return { type: "blob", blob };
  } catch (error) {
    console.error("Failed to parse body:", error);
    return { type: "error" };
  }
}
