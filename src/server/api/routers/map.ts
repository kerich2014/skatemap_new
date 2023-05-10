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
    const result = await ctx.prisma.placemarks.findMany()
    return result
  }),

  sendPoints: publicProcedure.input(z.object({
    title: z.string(),
    coordinatesX: z.string(),
    coordinatesY: z.string(),
    description: z.string(),
    photo: z.string()
    })).mutation(async ({ ctx, input }) => {
     const {title, coordinatesX, coordinatesY, description, photo} = input 
      
      const result = await ctx.prisma.placemarks.create({data: {title, coordinatesX, coordinatesY, description, photo}})
      
      return result
  }),


  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
