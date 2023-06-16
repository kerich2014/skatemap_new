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
import MailRuProvider from "next-auth/providers/mailru";
import VkProvider from "next-auth/providers/vk";

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
  // callbacks: {
  //   session: ({ session, user }) => ({
  //     ...session,
  //     user: {
  //       ...session.user,
  //       id: user.id,
  //     },
  //   }),
  // },
  // adapter: PrismaAdapter(prisma),
  providers: [
    VK({
      clientId: env.VK_CLIENT_ID,
      clientSecret: env.VK_CLIENT_SECRET
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
  callbacks: {
    session({ session, user }) {
      console.log(JSON.stringify(session))
      console.log(JSON.stringify(user))
      // if (session.user) {
      //   session.user.id = user.id
      // }
      
      return session
    },
  },
  pages: {
    // signIn: '/',
    // signOut: '/',
    newUser: '/',
  },
  secret: env.NEXTAUTH_SECRET,
  debug: true,
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


import {OAuthConfig, OAuthUserConfig} from 'next-auth/providers';

interface VkProfile {
    response: Array<{
        id: number;
        first_name: string;
        last_name: string;
        photo_100: string;
        can_access_closed: boolean;
        is_closed: boolean;
    }>;
}

export default function VK<P extends Record<string, any> = VkProfile>(
    options: OAuthUserConfig<P>,
): OAuthConfig<P> {
    const apiVersion = '5.126'; // https://vk.com/dev/versions

    return {
        id: 'vk',
        name: 'VK',
        type: 'oauth',
        authorization: `https://oauth.vk.com/authorize?scope=email&v=${apiVersion}`,
        token: {
            url: `https://oauth.vk.com/access_token?v=${apiVersion}`,
            async request({client, params, checks, provider}) {
                // exclude user_id and email from response
                const {user_id, email, ...tokens} = await client.oauthCallback(
                    provider.callbackUrl,
                    params,
                    checks,
                    {
                        exchangeBody: {
                            client_id: options.clientId,
                            client_secret: options.clientSecret,
                        },
                    },
                );

                return {tokens};
            },
        },
        userinfo: `https://api.vk.com/method/users.get?fields=photo_100&v=${apiVersion}`,
        profile(result: P) {
            const profile = result.response?.[0] ?? {};

            return {
                id: profile.id,
                name: [profile.first_name, profile.last_name]
                    .filter(Boolean)
                    .join(' '),
                email: null,
                image: profile.photo_100,
            };
        },
        options,
    };
}