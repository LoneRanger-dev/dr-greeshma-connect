import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

/** Verifies the JWT from the Authorization Bearer header OR the accessToken httpOnly cookie.
 *  On success, attaches the decoded payload to req.user. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Try Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // 2. Fall back to httpOnly cookie
  if (!token) {
    token = (req.cookies as Record<string, string | undefined>)?.accessToken;
  }

  if (!token) {
    res.status(401).json({ error: "Authentication required", code: "UNAUTHENTICATED" });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token", code: "TOKEN_EXPIRED" });
  }
}
