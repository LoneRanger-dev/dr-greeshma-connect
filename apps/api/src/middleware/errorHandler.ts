import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { zodErrorsToObject } from "@dr-greeshma/shared";
import { logger } from "../utils/logger";

/** Throw this anywhere in a route handler for a clean HTTP error response. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Prisma P2002 — unique constraint violation */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

/** Prisma P2025 — record not found */
function isNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: zodErrorsToObject(err),
    });
    return;
  }

  // Our own AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  // Prisma unique constraint
  if (isUniqueConstraintError(err)) {
    res.status(409).json({
      error: "A record with these details already exists",
      code: "DUPLICATE_ENTRY",
    });
    return;
  }

  // Prisma record not found
  if (isNotFoundError(err)) {
    res.status(404).json({ error: "Record not found", code: "NOT_FOUND" });
    return;
  }

  // Unknown — log and return generic message
  logger.error("Unhandled error:", err);
  const isDev = process.env.NODE_ENV !== "production";
  res.status(500).json({
    error: isDev && err instanceof Error ? err.message : "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
