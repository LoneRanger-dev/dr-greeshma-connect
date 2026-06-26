"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { SITE } from "@/config/site";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Hyderabad",
    service: "Pregnancy Consultation",
    avatar: "PS",
    quote:
      `${SITE.shortName} guided me through every trimester with such patience and expertise. The Google Meet consultations were so convenient during my third trimester. I felt completely safe and supported throughout.`,
  },
  {
    name: "Ananya Reddy",
    location: "Bengaluru",
    service: "PCOS Management",
    avatar: "AR",
    quote:
      `After years of irregular cycles, ${SITE.shortName} gave me a clear diagnosis and personalised treatment plan within the first consultation. The WhatsApp follow-ups made all the difference — I finally feel in control of my health.`,
  },
  {
    name: "Meera Krishnan",
    location: "Chennai",
    service: "Infertility Consultation",
    avatar: "MK",
    quote:
      `We were losing hope, but ${SITE.shortName}'s calm, evidence-based approach gave us a clear path forward. We are now expecting our first child. Words cannot express our gratitude for her care.`,
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % count), 5500);
    return () => clearInterval(id);
  }, [count]);

  const prev = () => setActive((p) => (p - 1 + count) % count);
  const next = () => setActive((p) => (p + 1) % count);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-teal">
            Patient Stories
          </span>
          <h2
            id="testimonials-heading"
            className="font-display text-3xl font-bold sm:text-4xl"
          >
            Voices of Trust
          </h2>
        </motion.div>

        {/* Carousel */}
        <AuroraBackground className="rounded-3xl">
          <div className="relative overflow-hidden rounded-3xl px-4 py-10 sm:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                <GlassCard className="p-8 sm:p-10">
                  {/* Quote icon */}
                  <Quote
                    className="mb-5 h-8 w-8 text-teal/50"
                    aria-hidden
                    strokeWidth={1.5}
                  />

                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-warning text-warning"
                        aria-hidden
                      />
                    ))}
                  </div>

                  {/* Quote text */}
                  <blockquote className="font-display mb-7 text-lg font-medium leading-relaxed text-foreground sm:text-xl">
                    &ldquo;{TESTIMONIALS[active].quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-violet text-sm font-bold text-white">
                      {TESTIMONIALS[active].avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {TESTIMONIALS[active].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {TESTIMONIALS[active].service} · {TESTIMONIALS[active].location}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </AuroraBackground>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          {/* Dots */}
          <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => setActive(i)}
                className="h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                style={{
                  width: i === active ? "2rem" : "0.5rem",
                  background:
                    i === active
                      ? "oklch(0.636 0.131 185.7)"
                      : "oklch(0.636 0.131 185.7 / 0.3)",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
