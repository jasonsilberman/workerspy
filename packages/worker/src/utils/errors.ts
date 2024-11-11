// copied from https://github.com/cloudflare/workers-chat-demo/blob/master/src/chat.mjs

export async function handleErrors(
  request: Request,
  func: () => Promise<Response>,
) {
  try {
    return await func();
  } catch (err) {
    if (request.headers.get("Upgrade") === "websocket") {
      // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
      // won't show us the response body! So... let's send a WebSocket response with an error
      // frame instead.
      const pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({ error: (err as Error).stack }));
      pair[1].close(1011, "Uncaught exception during session setup");
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    return new Response((err as Error).stack, { status: 500 });
  }
}
