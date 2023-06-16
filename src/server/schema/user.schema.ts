import * as z from 'zod'

export const createUserSchema = z.object({
  name: z.string(),
  password: z.string(),
})

export const signUpSchema = createUserSchema.extend({
  email: z.string().email(),
})

export type SignIn = z.infer<typeof createUserSchema>
export type SignUp = z.infer<typeof signUpSchema>