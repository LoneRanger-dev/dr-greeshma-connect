import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const API = process.env.API_URL ?? "http://localhost:4000";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [
    // ── Credentials (email + password) ────────────────────────────────────
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        try {
          const res = await fetch(`${API}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password }),
          });

          if (!res.ok) return null;

          const json = await res.json();
          const user = json.data.user;

          return {
            id:           user.id,
            name:         user.name,
            email:        user.email,
            role:         user.role,
            backendToken: json.data.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),

    // ── Google OAuth (wired; needs GOOGLE_CLIENT_ID/SECRET — Step 11) ─────
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
              return {
                id:           profile.sub,
                name:         profile.name,
                email:        profile.email,
                image:        profile.picture,
                role:         "PATIENT" as const,
                backendToken: "", // linked in Step 11 via /auth/google-link
              };
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Persist custom fields from the `User` object on first sign-in
      if (user && account) {
        token.id           = user.id;
        token.role         = user.role;
        token.backendToken = user.backendToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id         = token.id as string;
      session.user.role       = token.role;
      session.backendToken    = token.backendToken;
      return session;
    },
  },
});
