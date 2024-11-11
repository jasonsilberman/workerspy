import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface CopyableProps {
  text: string;
  className?: string;
}

export function Copyable({ text, className }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 p-2 cursor-pointer hover:bg-amber-50 transition-colors text-left border border-amber-300"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-4 h-4 text-green-600" />
      ) : (
        <ClipboardIcon className="w-4 h-4 text-amber-700" />
      )}
      <span className="text-gray-900">{text}</span>
    </button>
  );
}
