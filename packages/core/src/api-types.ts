import { z } from "zod";
import { selectRequestSchema } from "./requests/requests.sql";

export const webSocketIncomingMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("request"), request: selectRequestSchema }),
  z.object({ type: z.literal("pong") }),
]);

export const webSocketOutgoingMessageSchema = z.object({
  type: z.literal("ping"),
});
