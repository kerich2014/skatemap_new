import NextAuth from "next-auth";
import { authOptions } from "skatemap_new/server/auth";

export default NextAuth(authOptions);
