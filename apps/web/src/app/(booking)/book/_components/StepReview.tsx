"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { CalendarDays, Clock, User, Mail, Phone, Stethoscope, CreditCard, Loader2 } from "lucide-react";
import { parseISO } from "date-fns";
import { api, type ApiService, type SlotInfo, type ApiError, type RazorpayOrderResponse } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicButton } from "@/components/ui/magic-button";
import { formatDate, formatINR, formatTime } from "@/lib/utils";
import { useRazorpay } from "@/hooks/useRazorpay";
import type { PatientDetails } from "./StepDetails";
import { BRAND } from "@/config/site";

interface Props {
  service:    ApiService;
  date:       string;
  slot:       SlotInfo;
  patient:    PatientDetails;
  doctorId:   string;
  onBack:     () => void;
  onBooked:   (appointmentId: string) => void;
  onSlotGone: () => void;
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-teal" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function StepReview({
  service, date, slot, patient, doctorId, onBack, onBooked, onSlotGone,
}: Props) {
  const { data: session } = useSession();
  const { ready: rzpReady, error: rzpError } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [phase,   setPhase]   = useState<"idle" | "booking" | "payment" | "verifying">("idle");

  async function proceed() {
    setLoading(true);
    setPhase("booking");
    try {
      // ── 1. Auth ───────────────────────────────────────────────────────────
      let authToken = session?.backendToken ?? null;

      if (!authToken) {
        try {
          const regRes = await api.post<{ data: { accessToken: string } }>(
            "/auth/register",
            { name: patient.name, email: patient.email, phone: patient.phone, password: patient.password },
          );
          authToken = regRes.data.accessToken;
        } catch (regErr) {
          const err = regErr as ApiError;
          if (err.status === 409) {
            try {
              const loginRes = await api.post<{ data: { accessToken: string } }>(
                "/auth/login",
                { email: patient.email, password: patient.password },
              );
              authToken = loginRes.data.accessToken;
            } catch {
              toast.error("Incorrect password. Please check your credentials and try again.");
              setLoading(false);
              setPhase("idle");
              return;
            }
          } else {
            toast.error(err.error ?? "Failed to create account. Please try again.");
            setLoading(false);
            setPhase("idle");
            return;
          }
        }

        // Establish NextAuth session in background
        signIn("credentials", { email: patient.email, password: patient.password, redirect: false });
      }

      // ── 2. Book appointment (PENDING) ─────────────────────────────────────
      let appointmentId: string;
      try {
        const bookRes = await api.post<{ data: { id: string } }>(
          "/appointments",
          {
            doctorId,
            serviceId:    service.id,
            startsAt:     slot.startsAt,
            patientName:  patient.name,
            patientEmail: patient.email,
            patientPhone: patient.phone,
          },
          authToken,
        );
        appointmentId = bookRes.data.id;
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.status === 400 && apiErr.code === "SLOT_UNAVAILABLE") {
          toast.error("That slot was just booked by someone else. Please pick another time.", { duration: 5000 });
          onSlotGone();
          return;
        }
        toast.error(apiErr.error ?? "Failed to book. Please try again.");
        setLoading(false);
        setPhase("idle");
        return;
      }

      // ── 3. Create Razorpay order ──────────────────────────────────────────
      setPhase("payment");
      let orderData: RazorpayOrderResponse;
      try {
        const orderRes = await api.post<{ data: RazorpayOrderResponse }>(
          "/payments/order",
          { appointmentId },
          authToken,
        );
        orderData = orderRes.data;
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.code === "NOT_CONFIGURED") {
          // Razorpay not set up — treat booking as confirmed directly (dev mode)
          toast.success("Appointment booked! (Payments not configured — skipping checkout)", { duration: 5000 });
          onBooked(appointmentId);
          return;
        }
        toast.error("Could not initiate payment. Please try again.");
        setLoading(false);
        setPhase("idle");
        return;
      }

      // ── 4. Open Razorpay checkout ─────────────────────────────────────────
      if (!rzpReady || rzpError) {
        toast.error("Payment gateway failed to load. Please refresh and try again.");
        setLoading(false);
        setPhase("idle");
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const options: RazorpayOptions = {
          key:         orderData.keyId,
          amount:      service.priceInr * 100, // paise
          currency:    "INR",
          name:        BRAND,
          description: service.title,
          order_id:    orderData.orderId,
          prefill: {
            name:    patient.name,
            email:   patient.email,
            contact: patient.phone,
          },
          theme: { color: "#0EA5A4" },
          modal: {
            ondismiss: () => {
              toast("Payment cancelled. Your slot is reserved for a short time.", { duration: 6000 });
              setLoading(false);
              setPhase("idle");
              resolve();
            },
          },
          handler: async (response: RazorpayResponse) => {
            // ── 5. Verify signature on our backend ────────────────────────
            setPhase("verifying");
            try {
              await api.post<{ data: { appointmentId: string } }>(
                "/payments/verify",
                {
                  razorpayOrderId:   response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                authToken!,
              );
              toast.success("Payment successful! Appointment confirmed.");
              onBooked(appointmentId);
              resolve();
            } catch (err) {
              toast.error("Payment received but verification failed. Please contact support with your booking ID.");
              reject(err);
            }
          },
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", () => {
          toast.error("Payment failed. Please try again.");
          setLoading(false);
          setPhase("idle");
          resolve();
        });
        rzp.open();
      });
    } finally {
      if (phase !== "idle") {
        setLoading(false);
        setPhase("idle");
      }
    }
  }

  const buttonLabel = {
    idle:      "Proceed to Pay",
    booking:   "Booking slot…",
    payment:   "Opening payment…",
    verifying: "Verifying payment…",
  }[phase];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Review &amp; pay
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm the details below, then complete payment to confirm your appointment.
        </p>
      </div>

      <GlassCard className="flex flex-col gap-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal">
          Appointment
        </p>
        <Row icon={Stethoscope}  label="Consultation"  value={service.title} />
        <Row icon={CalendarDays} label="Date"          value={formatDate(parseISO(date))} />
        <Row icon={Clock}        label="Time (IST)"    value={formatTime(new Date(slot.startsAt))} />
        <Row icon={Clock}        label="Duration"      value={`${service.durationMin} minutes`} />
        <hr className="border-border/30" />
        <Row icon={User}         label="Patient name"  value={patient.name} />
        <Row icon={Mail}         label="Email"         value={patient.email} />
        <Row icon={Phone}        label="Phone"         value={patient.phone} />
        <hr className="border-border/30" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Consultation fee</span>
          <span className="text-base font-semibold text-teal">
            {formatINR(service.priceInr)}
          </span>
        </div>
        <div className="rounded-lg bg-teal/5 px-3 py-2 text-xs text-muted-foreground">
          Powered by{" "}
          <span className="font-medium text-foreground">Razorpay</span>. Your slot is secured
          after payment. Appointment link will be shared via email.
        </div>
      </GlassCard>

      <div className="flex gap-3 pt-2">
        <MagicButton
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          Back
        </MagicButton>
        <MagicButton
          onClick={proceed}
          disabled={loading || rzpError}
          className="flex-1 sm:flex-none gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {buttonLabel}
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              {buttonLabel}
            </>
          )}
        </MagicButton>
      </div>

      {rzpError && (
        <p className="text-center text-xs text-destructive">
          Payment gateway failed to load. Please refresh the page.
        </p>
      )}
    </div>
  );
}
