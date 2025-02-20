import "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    site?: {
      id: string;
      name: string;
      locationCode: string;
    };
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: Role;
      site?: {
        id: string;
        name: string;
        locationCode: string;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    site?: {
      id: string;
      name: string;
      locationCode: string;
    };
  }
}
