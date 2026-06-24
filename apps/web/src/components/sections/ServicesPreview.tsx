"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, HeartHandshake, Activity, Sparkles, ShieldCheck, Stethoscope } from "lucide-react";
import { MagicButton } from "@/components/ui/magic-button";

const SERVICES = [
  {
    slug: "pregnancy-consultation",
    icon: HeartHandshake,
    title: "Pregnancy Consultation",
    desc: "Expert antenatal care from first trimester through delivery, with personalised birth planning.",
    duration: "60 min",
    price: "₹1,200",
    color: "from-teal/15 to-teal/5",
    iconColor: "text-teal",
    border: "hover:border-teal/40",
  },
  {
    slug: "pcos-pcod-consultation",
    icon: Activity,
    title: "PCOS / PCOD Consultation",
    desc: "Evidence-based PCOS management covering hormones, diet, and long-term fertility health.",
    duration: "45 min",
    price: "₹900",
    color: "from-violet/15 to-violet/5",
    iconColor: "text-violet",
    border: "hover:border-violet/40",
  },
  {
    slug: "infertility-consultation",
    icon: Sparkles,
    title: "Infertility Consultation",
    desc: "Compassionate evaluation and guidance for couples navigating the fertility journey.",
    duration: "60 min",
    price: "₹1,500",
    color: "from-rose-gold/20 to-rose-gold/5",
    iconColor: "text-rose-gold",
    border: "hover:border-rose-gold/40",
  },
  {
    slug: "post-delivery-care",
    icon: ShieldCheck,
    title: "Post-Delivery Care",
    desc: "Comprehensive postnatal recovery, lactation support, and newborn health guidance.",
    duration: "30 min",
    price: "₹800",
    color: "from-teal/15 to-violet/10",
    iconColor: "text-teal",
    border: "hover:border-teal/40",
  },
  {
    slug: "general-gynecology",
    icon: Stethoscope,
    title: "General Gynecology",
    desc: "Annual check-ups, cervical screenings, contraception counselling, and women's wellness.",
    duration: "30 min",
    price: "₹700",
    color: "from-violet/15 to-rose-gold/10",
    iconColor: "text-violet",
    border: "hover:border-violet/40",
  },
];

export function ServicesPreview() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-teal">
            What We Offer
          </span>
          <h2
            id="services-heading"
            className="font-display text-3xl font-bold sm:text-4xl"
          >
            Specialised Care for Every Stage
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From your first prenatal visit to long-term gynaecological wellness — all
            consultations via secure Google Meet.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SERVICES.map(({ slug, icon: Icon, title, desc, duration, price, color, iconColor, border }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1], delay: i * 0.09 }}
            >
              <Link
                href={`/services/${slug}`}
                className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_oklch(0_0_0_/_0.1)] ${border} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2`}
              >
                {/* Icon */}
                <span
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}
                >
                  <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden />
                </span>

                {/* Title + desc */}
                <h3 className="font-display mb-2 font-semibold leading-snug">
                  {title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>

                {/* Meta */}
                <div className="mt-5 flex items-center justify-between text-xs font-medium">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    {duration}
                  </span>
                  <span className="font-semibold text-foreground">{price}</span>
                </div>

                {/* Arrow */}
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <MagicButton href="/services" variant="outline">
            View All Services
            <ArrowRight className="h-4 w-4" aria-hidden />
          </MagicButton>
        </motion.div>
      </div>
    </section>
  );
}
