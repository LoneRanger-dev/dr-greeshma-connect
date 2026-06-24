// Augment Express Request with the authenticated user payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;   // user id
        email: string;
        role: "PATIENT" | "DOCTOR" | "ADMIN";
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};
