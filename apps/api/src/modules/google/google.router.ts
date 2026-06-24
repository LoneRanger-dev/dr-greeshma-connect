import { Router, IRouter, Request, Response, NextFunction } from "express";
import { prisma } from "../../utils/prisma";
import { config } from "../../config";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { AppError } from "../../middleware/errorHandler";
import * as googleSvc from "./google.service";

export const googleRouter: IRouter = Router();

// GET /google/auth-url — returns the OAuth consent screen URL
googleRouter.get(
  "/auth-url",
  requireAuth,
  requireRole("DOCTOR", "ADMIN"),
  (_req: Request, res: Response) => {
    if (!config.google.clientId || !config.google.clientSecret) {
      res
        .status(503)
        .json({ error: "Google credentials not configured on the server", code: "NOT_CONFIGURED" });
      return;
    }
    res.json({ data: { url: googleSvc.getAuthUrl() } });
  },
);

// GET /google/status — check if Google Calendar is connected
googleRouter.get(
  "/status",
  requireAuth,
  requireRole("DOCTOR", "ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await prisma.doctorProfile.findUnique({
        where:  { userId: req.user!.sub },
        select: { id: true },
      });
      if (!profile) throw new AppError(404, "Doctor profile not found", "NOT_FOUND");

      const status = await googleSvc.getConnectionStatus(profile.id);
      res.json({ data: status });
    } catch (err) { next(err); }
  },
);

// GET /google/callback — OAuth2 redirect handler (public — called by Google after consent)
googleRouter.get(
  "/callback",
  async (req: Request, res: Response) => {
    const code       = req.query.code  as string | undefined;
    const oauthError = req.query.error as string | undefined;
    const successUrl = config.google.oauthSuccessUrl;

    if (oauthError || !code) {
      const reason = encodeURIComponent(oauthError ?? "cancelled");
      res.redirect(`${successUrl}?google=error&reason=${reason}`);
      return;
    }

    try {
      const tokens = await googleSvc.exchangeCodeForTokens(code);

      if (!tokens.refresh_token) {
        // Happens when the user has already connected before and Google doesn't re-issue it.
        // Tell the UI to ask them to revoke access at myaccount.google.com and try again.
        res.redirect(`${successUrl}?google=no_refresh_token`);
        return;
      }

      // Save to the first (and only) doctor profile
      const profile = await prisma.doctorProfile.findFirst({ select: { id: true } });
      if (profile) {
        await googleSvc.saveRefreshToken(profile.id, tokens.refresh_token);
      }

      res.redirect(`${successUrl}?google=connected`);
    } catch {
      res.redirect(`${successUrl}?google=error&reason=token_exchange_failed`);
    }
  },
);
