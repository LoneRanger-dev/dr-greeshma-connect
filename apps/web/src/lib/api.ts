const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface ApiError {
  status:   number;
  error:    string;
  code?:    string;
  details?: unknown;
}

export interface ApiService {
  id:          string;
  slug:        string;
  title:       string;
  description: string;
  durationMin: number;
  priceInr:    number;
}

export interface ApiDoctor {
  id:          string;
  bio:         string;
  specialties: string[];
  user:        { name: string };
}

export interface SlotInfo {
  startsAt: string;
  endsAt:   string;
  label:    string;
}

export interface SlotsResponse {
  data: {
    date:  string;
    slots: SlotInfo[];
  };
}

export interface AvailabilityResponse {
  data: { availableDates: string[] };
}

export interface AppointmentSummary {
  id:                 string;
  status:             string;
  startsAt:           string;
  endsAt:             string;
  amountInr:          number;
  patientName:        string;
  patientEmail:       string;
  patientPhone:       string | null;
  meetLink:           string | null;
  cancellationReason: string | null;
  notes:              string | null;
  service:            { id: string; title: string; durationMin: number; priceInr: number };
  doctor:             { id: string; user: { name: string } };
  patient:            { id: string; name: string; email: string; phone: string | null };
}

export interface AdminStats {
  todayAppointments:    number;
  weekRevenue:          number;
  upcomingAppointments: number;
  cancellations:        number;
  recentAppointments:   {
    id:          string;
    startsAt:    string;
    endsAt:      string;
    status:      string;
    amountInr:   number;
    patientName: string;
    meetLink:    string | null;
    service:     { id: string; title: string; durationMin: number };
  }[];
  revenueByDay:          { date: string; amount: number }[];
  appointmentsByService: { service: string; count: number }[];
}

export interface AvailabilityRule {
  id:              string;
  doctorId:        string;
  weekday:         number;
  startTime:       string;
  endTime:         string;
  slotIntervalMin: number;
  isRecurring:     boolean;
  validFrom:       string;
  validTo:         string | null;
  createdAt:       string;
}

export interface BlockedDate {
  id:        string;
  date:      string;
  reason:    string | null;
  createdAt: string;
}

export interface AdminPatient {
  id:        string;
  name:      string;
  email:     string;
  phone:     string | null;
  createdAt: string;
  _count:    { appointments: number };
  appointments: {
    id:      string;
    status:  string;
    startsAt: string;
    service: { title: string };
  }[];
}

export interface RazorpayOrderResponse {
  orderId: string;
  keyId:   string;
}

export interface PaymentStatus {
  id:                string;
  status:            "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  amountInr:         number;
  razorpayOrderId:   string;
  razorpayPaymentId: string | null;
  createdAt:         string;
  updatedAt:         string;
}

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function request<T>(
  path:   string,
  init:   RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  let body: unknown;
  try { body = await res.json(); } catch { body = null; }

  if (!res.ok) {
    const e = (body ?? {}) as Partial<ApiError>;
    throw {
      status:  res.status,
      error:   e.error   ?? "Request failed",
      code:    e.code,
      details: e.details,
    } as ApiError;
  }

  return body as T;
}

export const api = {
  get:    <T>(path: string,               token?: string) => request<T>(path, {},                                           token),
  post:   <T>(path: string, body: unknown, token?: string) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }, token),
  patch:  <T>(path: string, body: unknown, token?: string) => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }, token),
  delete: <T>(path: string,               token?: string) => request<T>(path, { method: "DELETE" },                          token),
};
