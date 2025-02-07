import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { SESSION_TTL_HOURS, JWT_VERSION } from "./config";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Note: This only affects new sessions. Existing sessions will retain their original expiration time.
    // To force all users to get new sessions with this expiration, they would need to log out and log back in.
    maxAge: Number(SESSION_TTL_HOURS) * 60 * 60, // Convert hours to seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Set initial token data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.version = JWT_VERSION;
      } else if (!token.version || token.version !== JWT_VERSION) {
        // Force reauth if token version doesn't match current version
        throw new Error("Token version mismatch");
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as Role;
      }

      // Debug session construction
      // console.log("Session construction:", {
      //   token,
      //   sessionUser: session.user,
      // });

      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  debug: true,
};
