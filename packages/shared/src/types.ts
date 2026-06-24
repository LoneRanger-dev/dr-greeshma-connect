// Shared TypeScript types — mirrored from Prisma models (populated in Step 5)

export type Role = "PATIENT" | "DOCTOR" | "ADMIN";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type PaymentStatus = "CREATED" | "PAID" | "FAILED" | "REFUNDED";

export type NotificationChannel = "EMAIL" | "WHATSAPP" | "SMS";

export type SlotInterval = 10 | 15 | 30 | 60;
