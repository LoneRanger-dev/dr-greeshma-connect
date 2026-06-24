import express, { Router, IRouter, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/errorHandler";
import * as paymentsSvc from "./payments.service";

export const paymentsRouter: IRouter = Router();

// 10 payment initiations per IP per 15 min — prevents card-enumeration / brute-force abuse
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Too many payment attempts, please try again later", code: "RATE_LIMITED" },
});

// ── POST /payments/order — PATIENT creates a Razorpay order for an appointment ─

const CreateOrderSchema = z.object({ appointmentId: z.string().min(1) });

paymentsRouter.post(
  "/order",
  paymentLimiter,
  requireAuth,
  validate(CreateOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentsSvc.createOrder(
        req.body.appointmentId as string,
        req.user!.sub,
      );
      res.status(201).json({ data: result });
    } catch (err) { next(err); }
  },
);

// ── POST /payments/verify — verify Razorpay signature after checkout success ──

const VerifySchema = z.object({
  razorpayOrderId:   z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

paymentsRouter.post(
  "/verify",
  paymentLimiter,
  requireAuth,
  validate(VerifySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body as z.infer<typeof VerifySchema>;
      const result = await paymentsSvc.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        req.user!.sub,
      );
      res.json({ data: result });
    } catch (err) { next(err); }
  },
);

// ── GET /payments/status/:appointmentId ─────────────────────────────────────

paymentsRouter.get(
  "/status/:appointmentId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentsSvc.getPaymentStatus(
        req.params.appointmentId,
        req.user!.sub,
        req.user!.role,
      );
      res.json({ data: result });
    } catch (err) { next(err); }
  },
);

// ── POST /webhooks/razorpay — public, raw body for HMAC ──────────────────────
// This router MUST be mounted BEFORE express.json() or with the raw body middleware.
// We export it separately so index.ts can mount it before the JSON body parser.

export const razorpayWebhookRouter: IRouter = Router();

razorpayWebhookRouter.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers["x-razorpay-signature"] as string | undefined;
      if (!signature) throw new AppError(400, "Missing x-razorpay-signature header", "MISSING_SIGNATURE");

      const rawBody = (req.body as Buffer).toString("utf-8");
      await paymentsSvc.handleWebhook(rawBody, signature);
      res.json({ ok: true });
    } catch (err) { next(err); }
  },
);
