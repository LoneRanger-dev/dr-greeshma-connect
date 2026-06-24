import "dotenv/config";
import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { config } from "./config";
import { logger } from "./utils/logger";
import { auditLogMiddleware } from "./middleware/auditLog";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.router";

// ── App setup ─────────────────────────────────────────────────
const app: Application = express();

// Security headers
app.use(helmet());

// Force HTTPS in production via strict-transport-security (helmet sets HSTS by default)
// In production, also set: app.set("trust proxy", 1) behind a load balancer / reverse proxy.
if (config.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

// CORS — only allow the configured web origin(s)
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true, // allow cookies / Authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// httpOnly cookie parser
app.use(cookieParser());

// HTTP request logging
if (config.isDev) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Generic mutation audit log (supplements controller-level explicit logs)
app.use(auditLogMiddleware);

// ── Routes ────────────────────────────────────────────────────

/** Health check — no auth, no rate-limit, no audit */
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: config.nodeEnv });
});

app.use("/auth", authRouter);

// Placeholder routers — populated in Steps 7–13
// app.use("/slots",        slotsRouter);
// app.use("/appointments", appointmentsRouter);
// app.use("/payments",     paymentsRouter);
// app.use("/webhooks",     webhooksRouter);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found", code: "NOT_FOUND" });
});

// ── Centralized error handler (must be last) ──────────────────
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// ── Start server ──────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(`API server running on http://localhost:${config.port} [${config.nodeEnv}]`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully…");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});

export default app;
