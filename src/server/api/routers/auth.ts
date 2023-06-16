import { signUpSchema } from "skatemap_new/server/schema/user.schema"
import { createTRPCRouter, publicProcedure } from "../trpc"
import * as trpc from "@trpc/server"
import { hash } from "argon2"


export const authRouter = createTRPCRouter({
    auth: publicProcedure
    .input(signUpSchema) 
    .mutation(
        async ({ ctx, input }) => {
          const { name, email, password } = input
      
          const exists = await ctx.prisma.user.findFirst({
            where: { name },
          })
      
          if (exists) {
            throw new trpc.TRPCError({
              code: 'CONFLICT',
              message: 'User already exists.',
            })
          }
      
          const hashedPassword = await hash(password)
      
          const result = await ctx.prisma.user.create({
            data: { name, email, password: hashedPassword },
          })
      
          return {
            status: 201,
            message: 'Account created successfully',
            result: { email: result.email, username: result.name },
          }
        },
      )
})