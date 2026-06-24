import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";

const SENSITIVE_KEYS = new Set(["password", "passwordHash", "token", "secret", "otp"]);

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj ?? {}).map(([k, v]) => [k, SENSITIVE_KEYS.has(k) ? "[REDACTED]" : v]),
  );
}

/** Explicit audit-log writer called by controllers for business-significant events. */
export async function writeAuditLog(params: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId:  params.actorId,
        action:   params.action,
        entity:   params.entity,
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    // Never let audit logging crash the main request
    logger.warn("auditLog write failed:", err);
  }
}

/** Generic middleware that auto-logs every mutating HTTP request after it completes. */
export function auditLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }

  res.on("finish", () => {
    // Only log successful mutations
    if (res.statusCode >= 400) return;

    const parts  = req.path.split("/").filter(Boolean);
    const entity  = parts[0] ?? "unknown";
    const entityId = (req.params as Record<string, string>)?.id ?? parts[1] ?? "-";

    writeAuditLog({
      actorId:  req.user?.sub ?? null,
      action:   `${req.method}:${req.path}`,
      entity,
      entityId,
      metadata: {
        statusCode: res.statusCode,
        body:       sanitize((req.body ?? {}) as Record<string, unknown>),
        ip:         req.ip,
      },
    });
  });

  next();
}
