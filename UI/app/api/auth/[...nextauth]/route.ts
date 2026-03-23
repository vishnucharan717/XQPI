
import { toSession, toToken } from "../../../models/session";
import { LoginResponse } from "../../../models/session/types";
import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const signIn = async (params: { username: any; password: any }) => {
  const { username, password } = params;
  const response = await axios.post<{
    data: any;
  }>('http://localhost:9000/api/login/', {
    username: username,
    password: password,
  });

  if (response.data) {
    console.log("response", response)
    return response.data; // This should be a LoginResponse
  } else {
    throw new Error("Invalid login response");
  }
};

const refreshToken = async (params: { token: any, refresh: any }) => {
  const { token, refresh } = params;
  const response = await axios.post<{
    data: any;
  }>(
    `${process.env.API_URL}token/refresh/`,
    { refresh: refresh },
    { headers: { Authorization: token } }
  );

  console.log("refresh token response", response.data)
  return response.data;
};

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("In handler")
        if (!credentials || !credentials?.username || !credentials?.password) {
          return null;
        }
        const user = signIn({
          username: credentials?.username,
          password: credentials?.password,
        });
        console.log("user", user)
        return user;
      },
    }),
  ],
  pages: {
    signIn: '/login', // route for custom login sign-in
    error: '/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days    
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("In jwt callback")
      console.log("User is jwt callback", user)
      if (user) {
        console.log("user", user)
        token.role = user.user_data.role
        token.username = user.user_data.username
        token.accessToken = user.access
        token.refreshToken = user.refresh
        token.expired_at = user.expired_at

        console.log("token", token)
        return token
      }
      console.log("------------token check-----------", token)
      if (token) {
        const [datePart, timePart] = token.expired_at.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        let token_expiry = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)))
        if (new Date() < token_expiry) {
          console.log("token expires at", token.expired_at)
          console.log("token not expired")
          console.log("current date and time", new Date())
          console.log("expired at date and time", token_expiry)
          return token;
        } else {
          console.log("token expired", token.expired_at)
          try {
            const refresh: any = await refreshToken({ token: token.accessToken, refresh: token.refreshToken })
            console.log("refresh?.access", refresh)
            token.accessToken = refresh?.access
            token.expired_at = refresh?.expired_at
            token.refreshToken = refresh?.refresh
            console.log("-------token after getting refresh token--------", token)
            return token
          } catch (error) {
            console.log("Error occured durin refresh token")
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log("In session callback")
      if (session?.user) {
        // session.user = token
        session.user.role = token.role
        session.user.username = token.username as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  // jwt: {
  //     secret: process.env.JWT_SECRET,
  //     // encryption: true, // Optional encryption of JWT tokens
  // },
  // session: {
  //   strategy: "jwt",
  //   maxAge: 432000,
  //      //jwt: true, // Use JWT for session management
  // },
  //   callbacks: {
  //     async jwt({token, user}) {
  //       if (user) {
  //         token.accessToken = user.access_token;
  //       }

  //       if (new Date() < new Date(token.expired_at || "")) {
  //         return token;
  //       }
  //       }

  //       try {
  //         const response = await refreshToken({
  //           token: token.refreshToken,
  //         });

  //         return toToken(response);
  //       } catch (error) {
  //         return {
  //           ...token,
  //           error: "RefreshAccessTokenError" as const,
  //         };
  //       }
  //     },
  //     async session({ session, token }) {
  //         session.accessToken = token.accessToken

  //       //return toSession(token, session);
  //     },
  //},
});

export { handler as GET, handler as POST };