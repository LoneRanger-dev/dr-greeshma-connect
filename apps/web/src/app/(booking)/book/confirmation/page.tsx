"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Stethoscope,
  Video,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { api, type AppointmentSummary } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicButton } from "@/components/ui/magic-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR, formatTime } from "@/lib/utils";

function ConfirmationContent() {
  const params        = useSearchParams();
  const appointmentId = params.get("id");
  const { data: session } = useSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn:  () =>
      api.get<{ data: AppointmentSummary }>(
        `/appointments/${appointmentId}`,
        session?.backendToken,
      ),
    enabled:   !!appointmentId,
    staleTime: 30_000,
    retry:     false,
    // Refetch once to pick up the Meet link if Google event creation is in-flight
    refetchInterval: (query) => {
      const appt = (query.state.data as { data: AppointmentSummary } | undefined)?.data;
      if (appt?.status === "CONFIRMED" && !appt.meetLink) return 5_000;
      return false;
    },
  });

  const appt = data?.data;

  if (!appointmentId) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        No appointment ID found.{" "}
        <Link href="/book" className="text-teal underline underline-offset-2">
          Book again
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 py-16">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto h-6 w-48 rounded" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !appt) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">
          Appointment booked! We couldn&apos;t load the details right now.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Check your email for confirmation. ID: {appointmentId}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto flex max-w-lg flex-col items-center gap-6 py-12"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
        className="flex size-20 items-center justify-center rounded-full bg-teal/10 shadow-glow"
      >
        <CheckCircle2 className="size-10 text-teal" />
      </motion.div>

      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          You&apos;re booked!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A confirmation has been sent to{" "}
          <span className="font-medium text-foreground">{appt.patientEmail}</span>.
        </p>
      </div>

      {/* Appointment card */}
      <GlassCard glow className="w-full p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">
            Booking details
          </p>
          <Badge variant="secondary" className="text-xs">
            {appt.status}
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Stethoscope className="mt-0.5 size-4 shrink-0 text-teal/70" />
            <div>
              <p className="text-[11px] text-muted-foreground">Consultation</p>
              <p className="text-sm font-medium text-foreground">{appt.service.title}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-teal/70" />
            <div>
              <p className="text-[11px] text-muted-foreground">Date</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(new Date(appt.startsAt))}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-teal/70" />
            <div>
              <p className="text-[11px] text-muted-foreground">Time (IST)</p>
              <p className="text-sm font-medium text-foreground">
                {formatTime(new Date(appt.startsAt))} –{" "}
                {formatTime(new Date(appt.endsAt))}
              </p>
            </div>
          </div>

          {/* Meet link — shown once doctor confirms and Google event is created */}
          {appt.meetLink && (
            <div className="flex items-start gap-3">
              <Video className="mt-0.5 size-4 shrink-0 text-teal/70" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Google Meet</p>
                <a
                  href={appt.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-teal hover:underline underline-offset-2 truncate"
                >
                  Join consultation
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </div>
            </div>
          )}

          <hr className="border-border/30" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Consultation fee</span>
            <span className="text-base font-semibold text-teal">
              {formatINR(appt.amountInr)}
            </span>
          </div>

          {appt.status === "PENDING" && (
            <p className="text-xs text-muted-foreground">
              Payment link will be sent to your email. Appointment is{" "}
              <span className="font-medium text-foreground">PENDING</span> until payment is received.
            </p>
          )}

          {appt.status === "CONFIRMED" && !appt.meetLink && (
            <p className="text-xs text-amber-600/80">
              Your appointment is confirmed. A Google Meet link is being generated and will appear here shortly.
            </p>
          )}

          <div className="mt-1 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Booking ID: </span>
            <span className="font-mono">{appt.id.slice(-12).toUpperCase()}</span>
          </div>
        </div>
      </GlassCard>

      {/* Action buttons */}
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        {appt.meetLink ? (
          <a href={appt.meetLink} target="_blank" rel="noopener noreferrer" className="flex-1">
            <MagicButton variant="outline" className="w-full gap-2">
              <Video className="size-4" />
              Join Google Meet
            </MagicButton>
          </a>
        ) : (
          <MagicButton
            variant="outline"
            className="flex-1"
            disabled
            title="Meet link will be available after doctor confirms your appointment"
          >
            <Video className="size-4" />
            {appt.status === "CONFIRMED" ? "Meet link generating…" : "Meet link (after confirmation)"}
          </MagicButton>
        )}
        <Link href="/" className="flex-1">
          <MagicButton className="w-full">
            Back to Home
            <ArrowRight className="ml-1.5 size-4" />
          </MagicButton>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ConfirmationPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-lg rounded-2xl" />}>
        <ConfirmationContent />
      </Suspense>
    </section>
  );
}
