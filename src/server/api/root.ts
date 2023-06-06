import { createTRPCRouter } from "skatemap_new/server/api/trpc";
import { exampleRouter } from "skatemap_new/server/api/routers/example";
import { mapRouter } from "skatemap_new/server/api/routers/map";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  map: mapRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
