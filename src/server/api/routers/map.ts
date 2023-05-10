import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "skatemap_new/server/api/trpc";

export const mapRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.placemarks.findMany()
  }),

  sendPoints: publicProcedure.input(z.object({
    title: z.string(),
    coordinates: z.string(),
    description: z.string(),
    photo: z.string()
    })).mutation(async ({ ctx, input }) => {
     const {title, coordinates, description, photo} = input 
      
      const result = await ctx.prisma.placemarks.create({data: {title, coordinates, description, photo}})
      
      return result
  }),


  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
