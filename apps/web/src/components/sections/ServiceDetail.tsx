"use client";

import { motion } from "framer-motion";
import { getServiceBySlug } from "@/lib/services";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicButton } from "@/components/ui/magic-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CheckCircle2, ListOrdered, Clock, IndianRupee, Video, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] } },
};
const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

export function ServiceDetail({ slug }: { slug: string }) {
  const service = getServiceBySlug(slug);
  if (!service) return null;

  const {
    Icon,
    title,
    tagline,
    summary,
    description,
    included,
    whatToExpect,
    duration,
    priceInr,
    faqs,
    gradient,
    iconColor,
  } = service;

  return (
    <>
      {/* ── Service hero ── */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className={cn(
              "overflow-hidden rounded-3xl bg-gradient-to-br p-8 sm:p-12",
              gradient,
              "ring-1 ring-border/50",
            )}
          >
            <motion.div variants={fadeUp} className="mb-4">
              <div
                className={cn(
                  "inline-flex h-16 w-16 items-center justify-center rounded-2xl",
                  "bg-background/60 ring-1 ring-border/50 shadow-md",
                )}
              >
                <Icon className={cn("h-8 w-8", iconColor)} aria-hidden />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-3">
              <h1 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
              <p className="text-lg text-muted-foreground">{tagline}</p>
              <p className="max-w-2xl leading-relaxed text-foreground/80">{summary}</p>
            </motion.div>

            {/* Pricing meta + CTA */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-4 rounded-2xl bg-background/70 px-5 py-3 ring-1 ring-border/40">
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-teal" aria-hidden />
                  <span className="font-medium">{duration}</span>
                </div>
                <span className="h-4 w-px bg-border" aria-hidden />
                <div className="flex items-center gap-0.5 text-sm font-semibold">
                  <IndianRupee className="h-4 w-4 text-teal" aria-hidden />
                  <span>{priceInr.toLocaleString("en-IN")}</span>
                </div>
                <span className="h-4 w-px bg-border" aria-hidden />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Video className="h-4 w-4 text-teal" aria-hidden />
                  Google Meet
                </div>
              </div>

              <MagicButton href={`/book?service=${slug}`} size="lg">
                Book this Consultation
                <ArrowRight className="h-5 w-5" aria-hidden />
              </MagicButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Description + What's included + What to expect ── */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-10">

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
          >
            <GlassCard className="p-6 sm:p-8">
              <h2 className="font-display mb-4 text-xl font-bold">About This Consultation</h2>
              <p className="leading-relaxed text-foreground/80">{description}</p>
            </GlassCard>
          </motion.div>

          {/* Two-col grid: included + what to expect */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* What's included */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
            >
              <GlassCard className="h-full p-6 sm:p-8">
                <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
                  <CheckCircle2 className="h-5 w-5 text-teal" aria-hidden />
                  What&apos;s Included
                </h2>
                <ul className="space-y-3" role="list">
                  {included.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>

            {/* What to expect */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
            >
              <GlassCard className="h-full p-6 sm:p-8">
                <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold">
                  <ListOrdered className="h-5 w-5 text-violet" aria-hidden />
                  What to Expect
                </h2>
                <ol className="space-y-4" role="list">
                  {whatToExpect.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-violet text-xs font-bold text-white"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-foreground/80">{step}</span>
                    </li>
                  ))}
                </ol>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ Accordion ── */}
      <section
        className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby={`faq-heading-${slug}`}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="mb-10 text-center"
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-teal">
              FAQ
            </span>
            <h2
              id={`faq-heading-${slug}`}
              className="font-display text-2xl font-bold sm:text-3xl"
            >
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="overflow-hidden rounded-xl border border-border bg-card px-5 data-[state=open]:border-teal/40 data-[state=open]:shadow-[0_0_16px_oklch(0.636_0.131_185.7_/_0.12)]"
                >
                  <AccordionTrigger className="py-4 text-left text-base font-semibold hover:text-teal hover:no-underline [&[data-state=open]]:text-teal">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ── Sticky bottom CTA ── */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
          className="space-y-4"
        >
          <h2 className="font-display text-2xl font-bold">
            Ready to book your {title.toLowerCase()}?
          </h2>
          <p className="text-muted-foreground">
            Secure · Private · Google Meet · Written care plan included
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <MagicButton href={`/book?service=${slug}`} size="lg">
              Book this Consultation
              <ArrowRight className="h-5 w-5" aria-hidden />
            </MagicButton>
            <MagicButton href="/services" variant="outline" size="lg">
              View All Services
            </MagicButton>
          </div>
        </motion.div>
      </section>
    </>
  );
}
