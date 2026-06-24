"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiService, type SlotInfo, type ApiDoctor } from "@/lib/api";
import { StepService } from "./_components/StepService";
import { StepDate } from "./_components/StepDate";
import { StepTime } from "./_components/StepTime";
import { StepDetails, type PatientDetails } from "./_components/StepDetails";
import { StepReview } from "./_components/StepReview";
import { SummaryPanel } from "./_components/SummaryPanel";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WizardState {
  service: ApiService | null;
  date:    string | null;
  slot:    SlotInfo | null;
  patient: PatientDetails | null;
}

const STEPS = [
  "Service",
  "Date",
  "Time",
  "Details",
  "Review",
] as const;

// ── Animations ────────────────────────────────────────────────────────────────

const stepVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir *  40 }),
  center: {              opacity: 1, x: 0            },
  exit:   (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

const transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

// ── Component ─────────────────────────────────────────────────────────────────

export default function BookPage() {
  const router = useRouter();
  const [step,      setStep]      = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<WizardState>({
    service: null, date: null, slot: null, patient: null,
  });

  // Fetch doctor profile once (needed for booking payload)
  const { data: doctorData } = useQuery({
    queryKey:  ["doctor"],
    queryFn:   () => api.get<{ data: ApiDoctor }>("/doctor"),
    staleTime: Infinity,
  });
  const doctorId = doctorData?.data.id ?? "";

  // ── Navigation helpers ───────────────────────────────────────────────────

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }, [step]);

  const goNext = useCallback(() => goTo(step + 1), [goTo, step]);
  const goBack = useCallback(() => goTo(step - 1), [goTo, step]);

  // Called when the taken-slot toast fires → go back to time picker, clear slot
  const handleSlotGone = useCallback(() => {
    setState((s) => ({ ...s, slot: null }));
    goTo(2);
  }, [goTo]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              {/* Circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                    i < step
                      ? "border-teal bg-teal text-white"
                      : i === step
                        ? "border-teal bg-card text-teal shadow-glow"
                        : "border-border/40 bg-card/30 text-muted-foreground",
                  )}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={cn(
                    "absolute top-10 hidden w-16 text-center text-[10px] font-medium sm:block",
                    i === step ? "text-teal" : "text-muted-foreground/60",
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line (skip after last) */}
              {i < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 transition-all duration-500 mx-1"
                  style={{
                    background: i < step
                      ? "var(--teal)"
                      : "oklch(var(--border) / 0.4)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout on large screens */}
      <div className="mt-10 flex gap-8 sm:mt-12">
        {/* Wizard steps */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === 0 && (
                <StepService
                  selected={state.service}
                  onSelect={(service) => setState((s) => ({ ...s, service, date: null, slot: null }))}
                  onNext={goNext}
                />
              )}

              {step === 1 && state.service && (
                <StepDate
                  service={state.service}
                  selected={state.date}
                  onSelect={(date) => setState((s) => ({ ...s, date, slot: null }))}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}

              {step === 2 && state.service && state.date && (
                <StepTime
                  service={state.service}
                  date={state.date}
                  selected={state.slot}
                  onSelect={(slot) => setState((s) => ({ ...s, slot }))}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}

              {step === 3 && (
                <StepDetails
                  initial={state.patient}
                  onNext={(patient) => {
                    setState((s) => ({ ...s, patient }));
                    goNext();
                  }}
                  onBack={goBack}
                />
              )}

              {step === 4 && state.service && state.date && state.slot && state.patient && (
                <StepReview
                  service={state.service}
                  date={state.date}
                  slot={state.slot}
                  patient={state.patient}
                  doctorId={doctorId}
                  onBack={goBack}
                  onBooked={(id) => router.push(`/book/confirmation?id=${id}`)}
                  onSlotGone={handleSlotGone}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky summary sidebar — visible on large screens only */}
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="sticky top-24">
            <SummaryPanel
              service={state.service}
              date={state.date}
              slot={state.slot}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
