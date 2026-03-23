import { LoginResponse, SessionInfo, TokenInfo } from "@/models/accounts/types";
import NextAuth from "next-auth";
import { JWT, DefaultJWt } from "next-auth/jwt";
import { DefaultSession, defaultUser } from "next-auth";

declare module "next-auth" {
  //interface Session extends SessionInfo {}
  interface Session {
    accessToken: string,
    expired_at: string,
    user: {
      id: string,
      role: string,
      username: string,
      county: string,
      agency: string      
    } & DefaultSession
  }

  //interface User extends LoginResponse {}
  interface User extends DefaultUser {
    role: string,
    access: string,
    refresh: string,
    expired_at: string,
    user_data: {
      role:string,
      username:string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWt {
    role: string,
    expired_at: string
  }
}
