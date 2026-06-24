import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body, res);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body, res);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept refresh token from httpOnly cookie OR request body
    const token: string | undefined =
      (req.cookies as Record<string, string | undefined>)?.refreshToken ??
      (req.body as { refreshToken?: string })?.refreshToken;

    const result = await authService.refresh(token, res);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export function logoutHandler(req: Request, res: Response) {
  const result = authService.logout(res);
  res.json({ data: result });
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.me(req.user!.sub);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function otpRequestHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.requestOtp(req.body);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function otpVerifyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyOtp(req.body, res);
    res.json({ data: result });
  } catch (err) { next(err); }
}
