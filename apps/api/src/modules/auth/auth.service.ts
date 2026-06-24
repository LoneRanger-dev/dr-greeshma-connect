import bcrypt from "bcryptjs";
import { Response } from "express";
import { prisma } from "../../utils/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AppError } from "../../middleware/errorHandler";
import { config } from "../../config";
import { logger } from "../../utils/logger";
import type { RegisterInput, LoginInput, OtpRequestInput, OtpVerifyInput } from "@dr-greeshma/shared";

// ── OTP in-memory store (swap for Redis in production) ────────
interface OtpEntry { otp: string; expiresAt: number }
const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function purgeExpiredOtps() {
  const now = Date.now();
  for (const [k, v] of otpStore) {
    if (v.expiresAt < now) otpStore.delete(k);
  }
}

// ── Cookie helpers ────────────────────────────────────────────
const ACCESS_COOKIE  = "accessToken";
const REFRESH_COOKIE = "refreshToken";

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = config.nodeEnv === "production";
  const base = { httpOnly: true, secure, sameSite: "strict" as const, path: "/" };

  res.cookie(ACCESS_COOKIE,  accessToken,  { ...base, maxAge: 15 * 60 * 1000 });          // 15 min
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
}

function clearTokenCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE,  { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

// ── Shared token builder ──────────────────────────────────────
function buildTokens(user: { id: string; email: string; role: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role as "PATIENT" | "DOCTOR" | "ADMIN" };
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

// ── Sanitise user before sending to client ────────────────────
function publicUser(u: {
  id: string; name: string; email: string; phone: string | null;
  role: string; emailVerified: Date | null; createdAt: Date; updatedAt: Date;
}) {
  return {
    id:            u.id,
    name:          u.name,
    email:         u.email,
    phone:         u.phone,
    role:          u.role,
    emailVerified: u.emailVerified?.toISOString() ?? null,
    createdAt:     u.createdAt.toISOString(),
    updatedAt:     u.updatedAt.toISOString(),
  };
}

// ═════════════════════════════════════════════════════════════
// Service functions
// ═════════════════════════════════════════════════════════════

export async function register(input: RegisterInput, res: Response) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, "An account with this email already exists", "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name:         input.name,
      email:        input.email,
      phone:        input.phone,
      passwordHash,
      role:         "PATIENT",
    },
  });

  const tokens = buildTokens(user);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return { user: publicUser(user), ...tokens };
}

export async function login(input: LoginInput, res: Response) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordHash) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");

  const tokens = buildTokens(user);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return { user: publicUser(user), ...tokens };
}

export async function refresh(rawRefreshToken: string | undefined, res: Response) {
  if (!rawRefreshToken) throw new AppError(401, "Refresh token required", "UNAUTHENTICATED");

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token", "TOKEN_EXPIRED");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError(401, "User not found", "USER_NOT_FOUND");

  const tokens = buildTokens(user);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return { accessToken: tokens.accessToken };
}

export function logout(res: Response) {
  clearTokenCookies(res);
  return { message: "Logged out successfully" };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  return { user: publicUser(user) };
}

// ── OTP (stubbed — replace body with real SMS provider in Step 13) ──

export async function requestOtp(input: OtpRequestInput) {
  purgeExpiredOtps();
  const otp = generateOtp();
  otpStore.set(input.phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5-min TTL

  if (config.isDev) {
    // In development, log to console instead of sending SMS
    logger.info(`[OTP STUB] Phone: ${input.phone}  OTP: ${otp}`);
  }
  // TODO (Step 13): send via WhatsApp / Twilio

  return { message: "OTP sent to your phone number" };
}

export async function verifyOtp(input: OtpVerifyInput, res: Response) {
  purgeExpiredOtps();
  const entry = otpStore.get(input.phone);

  if (!entry || entry.otp !== input.otp || entry.expiresAt < Date.now()) {
    throw new AppError(400, "Invalid or expired OTP", "INVALID_OTP");
  }

  otpStore.delete(input.phone);

  // Find or create patient by phone
  let user = await prisma.user.findFirst({ where: { phone: input.phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name:  "Patient",
        email: `otp_${input.phone.replace(/\D/g, "")}@placeholder.local`,
        phone: input.phone,
        role:  "PATIENT",
        emailVerified: new Date(),
      },
    });
  }

  const tokens = buildTokens(user);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  return { user: publicUser(user), ...tokens };
}
