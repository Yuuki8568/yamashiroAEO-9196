import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { posts, runs } from "./routes/posts";

// API features are oRPC procedures, one file per feature in ./routes/,
// composed into this router — typed end-to-end via the clients
// (web: src/web/lib/api.ts, mobile: lib/api.ts).
export const router = {
  ping,
  posts,
  runs,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

export default app;
