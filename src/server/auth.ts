import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "skatemap_new/env.mjs";
import { prisma } from "skatemap_new/server/db";
import Email, { EmailProvider } from "next-auth/providers/email";
import { Role } from "@prisma/client";
import { string } from "zod";
import CredentialsProvider from 'next-auth/providers/credentials'
import { createUserSchema } from "./schema/user.schema";
import { verify } from 'argon2'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      // ...other properties
    } & DefaultSession["user"];
    role: {
      id: string;
    }
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }

      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.name = token.name
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  adapter: PrismaAdapter(prisma),
  providers: [
  CredentialsProvider({
        name: 'credentials',
        credentials: {
          username: { label: 'Username', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        authorize: async (credentials, request) => {
          const creds = await createUserSchema.parseAsync(credentials)
  
          const user = await prisma.user.findFirst({
            where: { name: creds.name },
          })
  
          if (!user) {
            return null
          }
  
          const isValidPassword = await verify(user.password, creds.password)
  
          if (!isValidPassword) {
            return null
          }
  
          const result = {
            id: user.id,
            email: user.email,
            name: user.name,
          }
  
          return result
        },
      }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
