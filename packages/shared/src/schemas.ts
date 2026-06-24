// ============================================================
// Shared Zod schemas — used for request validation in api
// and form validation in web
// ============================================================
import { z } from "zod";

// ── Auth ───────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^[+\d\s\-()]{10,15}$/, "Invalid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const OtpRequestSchema = z.object({
  phone: z.string().min(10),
});

export const OtpVerifySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type OtpRequestInput = z.infer<typeof OtpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>;

// ── Appointments ───────────────────────────────────────────

export const BookAppointmentSchema = z.object({
  serviceId: z.string().cuid("Invalid service ID"),
  doctorId: z.string().cuid("Invalid doctor ID"),
  startsAt: z.string().datetime("Invalid datetime — must be ISO 8601 UTC"),
  patientName: z.string().min(2),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(10),
  notes: z.string().max(500).optional(),
});

export const RescheduleAppointmentSchema = z.object({
  startsAt: z.string().datetime("Invalid datetime — must be ISO 8601 UTC"),
});

export const CancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const AppointmentFilterSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "RESCHEDULED", "CANCELLED", "COMPLETED", "NO_SHOW"])
    .optional(),
  serviceId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>;
export type AppointmentFilterInput = z.infer<typeof AppointmentFilterSchema>;

// ── Slots ──────────────────────────────────────────────────

export const GetSlotsSchema = z.object({
  serviceId: z.string().cuid("Invalid service ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export const GetAvailabilitySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD"),
});

export type GetSlotsInput = z.infer<typeof GetSlotsSchema>;

// ── Availability Rules ─────────────────────────────────────

const ALLOWED_SLOT_INTERVALS = [10, 15, 30, 60] as const;

export const AvailabilityRuleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be HH:mm"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be HH:mm"),
  slotIntervalMin: z.union([
    z.literal(10),
    z.literal(15),
    z.literal(30),
    z.literal(60),
  ]),
  isRecurring: z.boolean().default(true),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime().nullable().optional(),
});

export type AvailabilityRuleInput = z.infer<typeof AvailabilityRuleSchema>;

// ── Blocked Dates ──────────────────────────────────────────

export const BlockDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  reason: z.string().max(200).optional(),
});

export const BlockDatesSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  reason: z.string().max(200).optional(),
});

export type BlockDateInput = z.infer<typeof BlockDateSchema>;
export type BlockDatesInput = z.infer<typeof BlockDatesSchema>;

// ── Payments ───────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  appointmentId: z.string().cuid("Invalid appointment ID"),
});

export const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  appointmentId: z.string().cuid(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

// ── Doctor profile update ──────────────────────────────────

export const UpdateDoctorProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  specialties: z.array(z.string()).max(20).optional(),
  consultFeeDefault: z.number().int().min(0).optional(),
});

export type UpdateDoctorProfileInput = z.infer<typeof UpdateDoctorProfileSchema>;

// ── Service management (admin) ─────────────────────────────

export const ServiceSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  durationMin: z.number().int().min(10).max(240),
  priceInr: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof ServiceSchema>;

// ── Shared validation helpers ──────────────────────────────

/** Returns a Zod error map for consistent API error formatting */
export function zodErrorsToObject(
  errors: z.ZodError,
): Record<string, string[]> {
  return errors.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const path = issue.path.join(".");
    if (!acc[path]) acc[path] = [];
    acc[path].push(issue.message);
    return acc;
  }, {});
}
