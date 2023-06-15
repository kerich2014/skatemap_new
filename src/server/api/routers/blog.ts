import { number, z } from "zod";

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
    const result = await ctx.prisma.blog.findMany({
      orderBy: {
        date: "desc"
      }
    })
    return result
  }),

  getById: publicProcedure.input(z.object({id: z.string()})).query(async({
    input, ctx}) => {
        const {id} = input
        if(id == null) return null
        const blog = await ctx.prisma.blog.findUnique({where: {id}, select: 
            {id: true, title: true, description: true, photo: true, date: true, userId: true}})
            if(blog == null) return
            return{
                id: blog.id,
                title: blog.title,
                description: blog.description,
                photo: blog.photo,
                date: blog.date,
                userId: blog.userId,
            }
    }),

  sendPost: publicProcedure.input(z.object({
    title: z.string(),
    description: z.string(),
    photo: z.string(),
    userId: z.string(),
    })).mutation(async ({ ctx, input }) => {
     const {title, description, photo, userId} = input 
      
      const result = await ctx.prisma.blog.create({data: {title, description, photo, userId}})
      
      return result
  }),

  deletePost: publicProcedure
  .input(z.string())
  .mutation(async ({ctx, input}) => {
    return ctx.prisma.blog.delete({
      where: {
        id: input
      }
    })
  }),
});
