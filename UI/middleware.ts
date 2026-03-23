
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // augments your Request with user's token.
  function middleware(request: NextRequestWithAuth) {
    // console.log("request",request.nextUrl.pathname);
    console.log("---------token from request-------------", request.nextauth.token);

    if (request.nextUrl.pathname.startsWith("/dashboard") && request.nextauth.token?.role != "admin") {
      return NextResponse.rewrite (
        new URL("/denied", request.url)
      )
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role == 'admin'
    },
  }
)

//export { default } from "next-auth/middleware"

export const config = { matcher: ["/extra"] }