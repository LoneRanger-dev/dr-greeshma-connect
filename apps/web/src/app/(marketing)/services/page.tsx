"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Service } from "@/lib/services";
import { SERVICES } from "@/lib/services";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { MagicButton } from "@/components/ui/magic-button";
import { SITE } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.19, 1, 0.22, 1] } },
};

function ServiceCard({ service }: { service: Service }) {
  const { Icon, slug, title, tagline, duration, priceInr, gradient, iconColor } = service;
  return (
    <motion.div variants={item}>
      <Link
        href={`/services/${slug}`}
        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-2xl"
        aria-label={`Learn more about ${title}`}
      >
        <GlassCard
          hover
          className={cn(
            "flex h-full flex-col gap-5 p-6 transition-all duration-300",
            "bg-gradient-to-br",
            gradient,
            service.borderHover,
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              "bg-background/60 shadow-sm ring-1 ring-border/50",
            )}
          >
            <Icon className={cn("h-7 w-7", iconColor)} aria-hidden />
          </div>

          {/* Copy */}
          <div className="flex-1 space-y-2">
            <h2 className="font-display text-xl font-bold leading-snug group-hover:text-teal transition-colors duration-200">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{tagline}</p>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {duration}
              </span>
              <span className="flex items-center gap-0.5 font-semibold text-foreground">
                <IndianRupee className="h-3.5 w-3.5" aria-hidden />
                {priceInr.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-teal opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              View details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <>
      {/* ── Hero ── */}
      <AuroraBackground className="pt-28 pb-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="space-y-5"
          >
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
              Telehealth · Secure · Private
            </Badge>
            <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              Expert Care for{" "}
              <span className="bg-gradient-to-r from-teal to-violet bg-clip-text text-transparent">
                Every Stage
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              From pregnancy planning to postnatal recovery — {SITE.shortName} provides
              comprehensive OB-GYN care via secure Google Meet consultations, from wherever
              you are in India.
            </p>
            <MagicButton href="/book" size="lg">
              Book a Consultation
              <ArrowRight className="h-5 w-5" aria-hidden />
            </MagicButton>
          </motion.div>
        </div>
      </AuroraBackground>

      {/* ── Services grid ── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="services-grid-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="services-grid-heading" className="sr-only">
            Our services
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Telehealth services"
          >
            {SERVICES.map((service) => (
              <div key={service.slug} role="listitem">
                <ServiceCard service={service} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works strip ── */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="how-heading">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="mb-12 space-y-3"
          >
            <h2
              id="how-heading"
              className="font-display text-2xl font-bold sm:text-3xl"
            >
              How a Consultation Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps from booking to care plan.
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose & Book",
                desc: "Select the consultation type, pick a time slot, and pay securely online.",
              },
              {
                step: "02",
                title: "Share Reports",
                desc: "Email your medical history and recent reports before the appointment.",
              },
              {
                step: "03",
                title: "Consult & Plan",
                desc: `Meet ${SITE.shortName} on Google Meet and receive a written care plan within 2 hours.`,
              },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  ease: [0.19, 1, 0.22, 1],
                  delay: i * 0.1,
                }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal to-violet text-sm font-bold text-white">
                  {step}
                </span>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
