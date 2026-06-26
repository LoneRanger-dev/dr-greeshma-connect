"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { MagicButton } from "@/components/ui/magic-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { SITE } from "@/config/site";

const AuroraOrb = dynamic(
  () => import("@/components/three/AuroraOrb").then((m) => ({ default: m.AuroraOrb })),
  { ssr: false, loading: () => <OrbFallback /> },
);

function OrbFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-gold/30 to-violet/30 blur-3xl" />
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-rose-gold/60 to-violet/50 blur-xl" />
        <div className="absolute inset-16 rounded-full bg-white/15 backdrop-blur-sm" />
      </div>
    </div>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.19, 1, 0.22, 1] } },
};

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <AuroraBackground className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: text content ── */}
          <motion.div
            variants={stagger}
            initial={reduced ? false : "hidden"}
            animate="show"
            className="space-y-7"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-sm font-medium text-teal backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" aria-hidden />
                OB-GYN · Telehealth Available
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.5rem]"
            >
              Your Women&rsquo;s Health,{" "}
              <span className="bg-gradient-to-r from-teal via-violet to-teal bg-clip-text text-transparent">
                Reimagined
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p variants={item} className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Book a secure video consultation with{" "}
              <strong className="font-semibold text-foreground">{SITE.doctorName}</strong>
              , specialist in pregnancy, PCOS, infertility, and gynaecology. Premium care from
              the comfort of your home.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <MagicButton href="/book" size="lg">
                Book Appointment
                <ArrowRight className="h-5 w-5" aria-hidden />
              </MagicButton>
              <MagicButton href="/services" variant="outline" size="lg">
                Explore Services
              </MagicButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.ul
              variants={item}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
              role="list"
            >
              {[
                "Same-day slots available",
                "Google Meet consultations",
                "WhatsApp follow-up",
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                  {t}
                </li>
              ))}
            </motion.ul>

            {/* Availability note */}
            <motion.p variants={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-teal" aria-hidden />
              Mon – Sat · 9 AM – 6 PM IST · Instant confirmation
            </motion.p>
          </motion.div>

          {/* ── Right: 3D orb ── */}
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.25 }}
            className="relative h-[380px] w-full lg:h-[580px]"
            aria-hidden
          >
            {reduced ? <OrbFallback /> : <AuroraOrb />}
          </motion.div>
        </div>
      </div>

      {/* Scroll hint — hidden under reduced motion to avoid infinite loop at duration:0 */}
      {!reduced && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.5, duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <div className="h-8 w-5 rounded-full border-2 border-foreground/25 p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-teal" />
          </div>
        </motion.div>
      )}
    </AuroraBackground>
  );
}
