import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role:         "PATIENT" | "DOCTOR" | "ADMIN";
    backendToken: string;
  }

  interface Session {
    backendToken: string;
    user: {
      id:    string;
      role:  "PATIENT" | "DOCTOR" | "ADMIN";
      name:  string | null;
      email: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role:         "PATIENT" | "DOCTOR" | "ADMIN";
    backendToken: string;
  }
}
