import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "skatemap_new/server/api/trpc";

export const blogRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.blog.findMany()
    return result
  }),

  sendPost: publicProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    photo: z.string()
    })).mutation(async ({ ctx, input }) => {
     const {title, description, photo} = input 
      
      const result = await ctx.prisma.blog.create({data: {title, description, photo}})
      
      return result
  }),

  deletePost: publicProcedure
  .input(z.number())
  .mutation(async ({ctx, input}) => {
    return ctx.prisma.blog.delete({
      where: {
        id: input
      }
    })
  }),
});
