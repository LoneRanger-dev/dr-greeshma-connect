import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  // Block /admin/** — DOCTOR and ADMIN only
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user?.role === "PATIENT") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

// Run middleware on all routes except Next.js internals and static assets
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
