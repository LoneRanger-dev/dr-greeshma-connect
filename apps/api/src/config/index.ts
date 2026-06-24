import "dotenv/config";

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: parseInt(optional("PORT", "4000"), 10),
  isDev: optional("NODE_ENV", "development") === "development",

  db: {
    url: optional("DATABASE_URL", ""),
    directUrl: optional("DIRECT_URL", ""),
  },

  jwt: {
    accessSecret: optional("JWT_ACCESS_SECRET", "dev-access-secret-CHANGE-IN-PROD"),
    refreshSecret: optional("JWT_REFRESH_SECRET", "dev-refresh-secret-CHANGE-IN-PROD"),
    accessExpiresIn: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  cors: {
    origins: optional("CORS_ORIGINS", "http://localhost:3000").split(",").map((s) => s.trim()),
  },

  razorpay: {
    keyId: optional("RAZORPAY_KEY_ID", ""),
    keySecret: optional("RAZORPAY_KEY_SECRET", ""),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET", ""),
  },

  google: {
    clientId:                 optional("GOOGLE_CLIENT_ID", ""),
    clientSecret:             optional("GOOGLE_CLIENT_SECRET", ""),
    calendarId:               optional("GOOGLE_CALENDAR_ID", "primary"),
    serviceAccountEmail:      optional("GOOGLE_SERVICE_ACCOUNT_EMAIL", ""),
    serviceAccountPrivateKey: optional("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "").replace(/\\n/g, "\n"),
    refreshToken:             optional("GOOGLE_REFRESH_TOKEN", ""),
    redirectUri:              optional("GOOGLE_REDIRECT_URI", "http://localhost:4000/google/callback"),
    oauthSuccessUrl:          optional("GOOGLE_OAUTH_SUCCESS_URL", "http://localhost:3006/admin/availability"),
  },

  smtp: {
    host: optional("SMTP_HOST", "smtp.gmail.com"),
    port: parseInt(optional("SMTP_PORT", "587"), 10),
    secure: optional("SMTP_SECURE", "false") === "true",
    user: optional("SMTP_USER", ""),
    pass: optional("SMTP_PASS", ""),
    from: optional("SMTP_FROM", "Dr. Greeshma Connect <no-reply@example.com>"),
  },

  whatsapp: {
    token: optional("WHATSAPP_TOKEN", ""),
    phoneId: optional("WHATSAPP_PHONE_ID", ""),
    verifyToken: optional("WHATSAPP_VERIFY_TOKEN", ""),
    templates: {
      bookingConfirmed: optional("WHATSAPP_TEMPLATE_BOOKING_CONFIRMED", "booking_confirmed"),
      bookingRescheduled: optional("WHATSAPP_TEMPLATE_BOOKING_RESCHEDULED", "booking_rescheduled"),
      bookingCancelled: optional("WHATSAPP_TEMPLATE_BOOKING_CANCELLED", "booking_cancelled"),
      reminder24h: optional("WHATSAPP_TEMPLATE_REMINDER_24H", "appointment_reminder_24h"),
      reminder1h: optional("WHATSAPP_TEMPLATE_REMINDER_1H", "appointment_reminder_1h"),
    },
  },
} as const;
