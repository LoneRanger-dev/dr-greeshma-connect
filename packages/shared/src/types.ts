// ============================================================
// Shared TypeScript types — mirrored from the Prisma schema
// Used by both apps/web and apps/api
// ============================================================

// ── Enums ──────────────────────────────────────────────────

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

export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

// Allowed slot durations in minutes
export type SlotIntervalMin = 10 | 15 | 30 | 60;

// ── Core models (serialised — all Dates as ISO strings) ────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  bio: string | null;
  specialties: string[];
  consultFeeDefault: number;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMin: number;
  priceInr: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRule {
  id: string;
  doctorId: string;
  /** 0=Sun 1=Mon … 6=Sat */
  weekday: number;
  /** "HH:mm" IST */
  startTime: string;
  /** "HH:mm" IST */
  endTime: string;
  slotIntervalMin: number;
  isRecurring: boolean;
  validFrom: string;
  validTo: string | null;
  createdAt: string;
}

export interface BlockedDate {
  id: string;
  doctorId: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  reason: string | null;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  serviceId: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  meetLink: string | null;
  googleEventId: string | null;
  amountInr: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional nested relations
  patient?: User;
  service?: Service;
}

export interface Payment {
  id: string;
  appointmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: PaymentStatus;
  amountInr: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  appointmentId: string;
  channel: NotificationChannel;
  type: string;
  status: NotificationStatus;
  sentAt: string | null;
  error: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ── Slot / availability types ──────────────────────────────

export interface TimeSlot {
  startsAt: string; // ISO UTC datetime
  endsAt: string;
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  hasSlots: boolean;
  totalSlots: number;
  bookedSlots: number;
}

// ── API response shapes ────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Auth payload ───────────────────────────────────────────

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: User;
  tokens: TokenPair;
}
