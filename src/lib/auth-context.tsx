"use client";

import {
  SessionProvider,
  useSession,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

import { Site } from "./types";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  site?: Site;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push("/");
  };

  // Ensure we return a properly typed user
  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as Role,
        site: session.user.site,
      }
    : null;

  return {
    user,
    loading: status === "loading",
    signOut,
  };
}
