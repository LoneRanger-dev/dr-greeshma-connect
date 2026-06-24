import { Request, Response, NextFunction } from "express";

type Role = "PATIENT" | "DOCTOR" | "ADMIN";

/** RBAC guard — call after requireAuth. Rejects requests whose role is not in the allow-list. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required", code: "UNAUTHENTICATED" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "You do not have permission to perform this action",
        code: "FORBIDDEN",
      });
      return;
    }
    next();
  };
}
