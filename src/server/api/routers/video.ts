import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "skatemap_new/server/api/trpc";

export const videoRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.videos.findMany()
    return result
  }),

  sendVideo: publicProcedure.input(z.object({
    video: z.string(),
    })).mutation(async ({ ctx, input }) => {
     const {video} = input 
      
      const result = await ctx.prisma.videos.create({data: {video}})
      
      return result
  }),

  deleteVideo: publicProcedure
  .input(z.number())
  .mutation(async ({ctx, input}) => {
    return ctx.prisma.videos.delete({
      where: {
        id: input
      }
    })
  }),
});
