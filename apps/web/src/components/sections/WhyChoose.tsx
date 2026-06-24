"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Video,
  Clock,
  MessageCircle,
  Heart,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "15+ Years of Expertise",
    desc: "Board-certified OB-GYN with advanced training in high-risk pregnancies and reproductive medicine.",
    accent: "teal",
  },
  {
    icon: Video,
    title: "Google Meet Consultations",
    desc: "Secure, private video consultations from your home. No travel, no waiting rooms.",
    accent: "violet",
  },
  {
    icon: Clock,
    title: "Instant Confirmation",
    desc: "Book online in under 2 minutes. Receive a Google Calendar invite and Meet link instantly.",
    accent: "teal",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Follow-Up",
    desc: "Report reviews, prescription queries, and 24-hour follow-up support on WhatsApp.",
    accent: "violet",
  },
  {
    icon: Heart,
    title: "Personalised Care Plans",
    desc: "Every consultation ends with a written care plan tailored specifically to your health journey.",
    accent: "rose",
  },
  {
    icon: Star,
    title: "4.9★ Rated by Patients",
    desc: "Trusted by 8,000+ patients across India for compassionate, evidence-based OB-GYN care.",
    accent: "teal",
  },
];

const accentMap: Record<string, { icon: string; bg: string }> = {
  teal: { icon: "text-teal", bg: "bg-teal/10" },
  violet: { icon: "text-violet", bg: "bg-violet/10" },
  rose: { icon: "text-rose-gold", bg: "bg-rose-gold/10" },
};

export function WhyChoose() {
  return (
    <section
      className="bg-muted/30 py-24 px-4 sm:px-6 lg:px-8"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-teal">
            Why Patients Choose Us
          </span>
          <h2
            id="why-heading"
            className="font-display text-3xl font-bold sm:text-4xl"
          >
            Healthcare That Comes to You
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            We combine clinical excellence with the convenience of modern telehealth —
            so you never have to choose between quality and comfort.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => {
            const { icon: iconCls, bg } = accentMap[accent];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1], delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_oklch(0_0_0_/_0.07)]"
              >
                <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-6 w-6 ${iconCls}`} aria-hidden />
                </span>
                <h3 className="font-display mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
