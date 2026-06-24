import nodemailer from "nodemailer";
import { config } from "../../config";
import { logger } from "../../utils/logger";

// ── Transporter (lazy singleton) ─────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!config.smtp.user || !config.smtp.pass) return null;
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host:   config.smtp.host,
    port:   config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  return _transporter;
}

// ── Send ─────────────────────────────────────────────────────────────────────

export async function sendEmail(
  to:      string,
  subject: string,
  html:    string,
): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter();

  if (!transport) {
    // Dev: log to console, no actual send
    logger.info(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  try {
    await transport.sendMail({
      from:    config.smtp.from,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Email failed to ${to}: ${msg}`);
    return { success: false, error: msg };
  }
}
