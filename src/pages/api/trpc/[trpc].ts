import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "skatemap_new/env.mjs";
import { createTRPCContext } from "skatemap_new/server/api/trpc";
import { appRouter } from "skatemap_new/server/api/root";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});
