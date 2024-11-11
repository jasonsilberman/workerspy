import { DurableObject } from "cloudflare:workers";
import { webSocketOutgoingMessageSchema } from "@workerspy/core/api-types";

// https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/
export class RequestsWebSocket extends DurableObject {
  connections = new Set<WebSocket>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const websockets = this.ctx.getWebSockets();

    for (const ws of websockets) {
      this.connections.add(ws);
    }
  }

  async fetch(req: Request) {
    const websocketPair = new WebSocketPair();
    const [client, server] = Object.values(websocketPair);

    this.ctx.acceptWebSocket(server);
    this.connections.add(client);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  webSocketError(ws: WebSocket, error: unknown) {
    this.connections.delete(ws);
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    try {
      const parsed = webSocketOutgoingMessageSchema.parse(JSON.parse(message));

      if (parsed.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }
    } catch (error) {
      console.error("Error parsing message", error, message);
    }
  }

  webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean,
  ) {
    this.connections.delete(ws);
  }

  broadcast(message: string) {
    for (const connection of this.connections) {
      connection.send(message);
    }
  }
}
