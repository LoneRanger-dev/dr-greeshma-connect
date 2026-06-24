import { Router, IRouter } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import {
  RegisterSchema,
  LoginSchema,
  OtpRequestSchema,
  OtpVerifySchema,
} from "@dr-greeshma/shared";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
  otpRequestHandler,
  otpVerifyHandler,
} from "./auth.controller";

export const authRouter: IRouter = Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later", code: "RATE_LIMITED" },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts", code: "RATE_LIMITED" },
});

// POST /auth/register
authRouter.post("/register", registerLimiter, validate(RegisterSchema), registerHandler);

// POST /auth/login
authRouter.post("/login", authLimiter, validate(LoginSchema), loginHandler);

// POST /auth/refresh
authRouter.post("/refresh", refreshHandler);

// POST /auth/logout
authRouter.post("/logout", logoutHandler);

// GET  /auth/me
authRouter.get("/me", requireAuth, meHandler);

// POST /auth/otp/request
authRouter.post("/otp/request", authLimiter, validate(OtpRequestSchema), otpRequestHandler);

// POST /auth/otp/verify
authRouter.post("/otp/verify", authLimiter, validate(OtpVerifySchema), otpVerifyHandler);
