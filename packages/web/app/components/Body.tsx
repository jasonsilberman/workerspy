type BodyProps = {
  type: "none" | "blob" | "text" | "json";
  raw: unknown | null;
  text: string | null;
  json: unknown | null;
};

export function Body({ type, raw, text, json }: BodyProps) {
  if (type === "none") {
    return <div className="text-gray-500 italic">No body</div>;
  }

  if (type === "blob" && raw) {
    return (
      <div className="bg-white border p-4">
        <div className="text-sm text-gray-500 mb-2">Binary data:</div>
      </div>
    );
  }

  if (type === "text" && text) {
    return (
      <div className="bg-white border overflow-hidden">
        <pre className="p-4 text-sm overflow-auto">{text}</pre>
      </div>
    );
  }

  if (type === "json" && json) {
    return (
      <div className="bg-white border overflow-hidden">
        <pre className="p-4 text-sm overflow-auto">
          {JSON.stringify(json, null, 2)}
        </pre>
      </div>
    );
  }

  return <div className="text-gray-500 italic">Empty body</div>;
}
