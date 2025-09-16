import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      username?: string;
      nik?: string;
      teleponWA?: string;
      isAutoCreated?: boolean;
    };
  }
  interface User {
    id: string;
    role: string;
    username?: string;
    nik?: string;
    teleponWA?: string;
    isAutoCreated?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    username?: string;
    nik?: string;
    teleponWA?: string;
    isAutoCreated?: boolean;
  }
}
