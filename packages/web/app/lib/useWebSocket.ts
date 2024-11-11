import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { useLatestRef } from "./useLatestRef";

export type WebSocketStatus =
  | "CONNECTING"
  | "OPEN"
  | "CLOSING"
  | "CLOSED"
  | "ERROR";

interface UseWebSocketOptions<TOut, TIn> {
  url: string | URL;
  outgoingMessageSchema?: z.Schema<TOut>;
  incomingMessageSchema?: z.Schema<TIn>;
  onMessage?: (message: TIn) => void;
  onConnect?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

interface UseWebSocketResult<TOut, TIn> {
  status: WebSocketStatus;
  messages: TIn[];
  send: (message: TOut) => void;
}

// broke boy AI gen'd shit
export function useWebSocket<TOut = unknown, TIn = unknown>({
  url,
  outgoingMessageSchema,
  incomingMessageSchema,
  onMessage,
  onConnect,
  onClose,
  onError,
  enabled = true,
}: UseWebSocketOptions<TOut, TIn>): UseWebSocketResult<TOut, TIn> {
  const [status, setStatus] = useState<WebSocketStatus>("CONNECTING");
  const [messages, setMessages] = useState<TIn[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Use latest refs for callbacks
  const onMessageRef = useLatestRef(onMessage);
  const onConnectRef = useLatestRef(onConnect);
  const onCloseRef = useLatestRef(onClose);
  const onErrorRef = useLatestRef(onError);

  // Determine WebSocket URL with proper protocol
  const getWebSocketUrl = useCallback((urlInput: string | URL) => {
    const urlString = urlInput.toString();
    if (urlString.startsWith("ws://") || urlString.startsWith("wss://")) {
      return urlString;
    }

    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    return protocol + urlString.replace(/^\/\/|^https?:\/\//, "");
  }, []);

  const createConnection = useCallback(() => {
    let shouldClose = false;

    const wsUrl = getWebSocketUrl(url);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!shouldClose) {
        setStatus("OPEN");
        onConnectRef.current?.();

        ws.send(JSON.stringify({ type: "ping" }));
      } else {
        ws.close();
      }
    };

    ws.onclose = () => {
      setStatus("CLOSED");
      onCloseRef.current?.();
    };

    ws.onerror = (error) => {
      setStatus("ERROR");
      onErrorRef.current?.(error);
    };

    ws.onmessage = (event) => {
      if (shouldClose) return;
      try {
        const parsed = JSON.parse(event.data);
        const validated = incomingMessageSchema
          ? incomingMessageSchema.parse(parsed)
          : parsed;
        setMessages((prev) => [...prev, validated]);
        onMessageRef.current?.(validated);
      } catch (error) {
        console.error("Failed to parse or validate incoming message:", error);
        onErrorRef.current?.(new Event("message-validation-error"));
      }
    };

    return () => {
      shouldClose = true;
      ws.close();
    };
  }, [
    url,
    incomingMessageSchema,
    getWebSocketUrl,
    onMessageRef,
    onConnectRef,
    onCloseRef,
    onErrorRef,
  ]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    return createConnection();
  }, [enabled, createConnection]);

  // Send message function
  const send = useCallback(
    (message: TOut) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }

      let validated: TOut;
      try {
        validated = outgoingMessageSchema
          ? outgoingMessageSchema.parse(message)
          : message;
      } catch (error) {
        throw new Error(`Message validation failed: ${String(error)}`);
      }

      wsRef.current.send(JSON.stringify(validated));
    },
    [outgoingMessageSchema],
  );

  return { status, messages, send };
}
