"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Badge } from "@/components/ui/badge";
import { MagicButton } from "@/components/ui/magic-button";
import {
  GraduationCap,
  Award,
  MapPin,
  Languages,
  Building2,
  CheckCircle2,
} from "lucide-react";

const QUALIFICATIONS = [
  { label: "MBBS", institution: "Osmania Medical College, Hyderabad" },
  { label: "MS — Obstetrics & Gynecology", institution: "NIMS, Hyderabad" },
  { label: "FMAS — Fellowship in Minimal Access Surgery", institution: "FMAS Board, India" },
];

const TIMELINE = [
  {
    year: "2006",
    title: "MBBS",
    institution: "Osmania Medical College, Hyderabad",
    desc: "Graduated with distinction in Obstetrics & Gynecology.",
  },
  {
    year: "2010",
    title: "MS in Obstetrics & Gynecology",
    institution: "Nizam's Institute of Medical Sciences (NIMS)",
    desc: "Post-graduate training with specialisation in high-risk pregnancies and operative obstetrics.",
  },
  {
    year: "2011",
    title: "Fellowship — Minimal Access Surgery",
    institution: "FMAS, India",
    desc: "Advanced laparoscopic training in gynaecological surgeries including ovarian cystectomy and myomectomy.",
  },
  {
    year: "2012",
    title: "Joined Apollo Hospitals, Hyderabad",
    institution: "Senior Consultant OB-GYN",
    desc: "Built a high-risk obstetrics unit managing 400+ deliveries annually.",
  },
  {
    year: "2018",
    title: "5,000 Safe Deliveries Milestone",
    institution: "",
    desc: "A landmark moment — 5,000 mothers supported through safe, complication-free deliveries.",
  },
  {
    year: "2021",
    title: "Launched Telehealth Practice",
    institution: "Dr. Greeshma Connect",
    desc: "Pioneered accessible telehealth OB-GYN care via Google Meet for patients across India.",
  },
  {
    year: "2024",
    title: "8,000+ Patients Served",
    institution: "",
    desc: "A community of 8,000+ women who have trusted Dr. Greeshma with their most important health journeys.",
  },
];

const SPECIALTIES = [
  "High-Risk Pregnancies",
  "PCOS / PCOD Management",
  "Infertility & IVF Counselling",
  "Laparoscopic Surgery",
  "Normal & C-Section Deliveries",
  "Postnatal & Lactation Care",
  "Cervical Screening & Colposcopy",
  "Contraception Counselling",
  "Menstrual Disorders",
  "Gynaecological Oncology Screening",
  "Menopause & HRT",
  "Prenatal Genetic Counselling",
];

const LANGUAGES = ["English", "Telugu", "Hindi"];

const AFFILIATIONS = [
  "Apollo Hospitals, Hyderabad",
  "NIMS — Nizam's Institute of Medical Sciences",
  "Indian Medical Association (IMA)",
  "Federation of Obstetric & Gynaecological Societies of India (FOGSI)",
];

function TimelineItem({
  year,
  title,
  institution,
  desc,
  index,
}: {
  year: string;
  title: string;
  institution: string;
  desc: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1], delay: index * 0.07 }}
      className="relative flex gap-6 pb-10 last:pb-0"
    >
      {/* Dot + vertical line */}
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-violet text-xs font-bold text-white shadow-[0_0_12px_oklch(0.636_0.131_185.7_/_0.4)]">
          {year.slice(2)}
        </div>
        <div className="mt-2 w-px flex-1 bg-gradient-to-b from-teal/40 to-violet/20" />
      </div>

      {/* Content */}
      <div className="pb-2 pt-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal">{year}</p>
        <h3 className="font-display mt-0.5 text-lg font-semibold text-foreground">{title}</h3>
        {institution && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {institution}
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ── Hero / Profile ── */}
      <AuroraBackground className="pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
              className="flex justify-center"
            >
              <GlassCard glow className="w-full max-w-sm overflow-hidden p-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                  <Image
                    src="/images/dr-greeshma.jpg"
                    alt="Dr. Greeshma Gopinath — Obstetrician & Gynecologist"
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 640px) 90vw, 400px"
                  />
                </div>
                <div className="px-2 py-4 text-center">
                  <p className="font-display text-xl font-bold">Dr. Greeshma Gopinath</p>
                  <p className="text-sm text-muted-foreground">MBBS · MS (OBG) · FMAS</p>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden />
                    Hyderabad, Telangana
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Profile info */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
              className="space-y-6"
            >
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-teal">
                  OB-GYN Specialist
                </span>
                <h1 className="font-display mt-2 text-4xl font-bold sm:text-5xl">
                  Dr. Greeshma{" "}
                  <span className="bg-gradient-to-r from-teal to-violet bg-clip-text text-transparent">
                    Gopinath
                  </span>
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  Obstetrician &amp; Gynecologist · 15+ Years Experience
                </p>
              </div>

              <p className="leading-relaxed text-foreground/80">
                Dr. Greeshma Gopinath is a board-certified Obstetrician &amp; Gynecologist with
                over 15 years of experience in high-risk pregnancies, PCOS management,
                infertility counselling, and minimally invasive gynaecological surgery. She
                combines clinical rigour with genuine empathy — taking time to listen, explain,
                and empower every patient to make informed decisions about her health.
              </p>

              <p className="leading-relaxed text-foreground/80">
                Having pioneered telehealth OB-GYN care in India since 2021, Dr. Greeshma
                has helped over 8,000 women access premium specialist care from the comfort of
                their homes — without compromising on quality, privacy, or personalisation.
              </p>

              {/* Qualifications */}
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <GraduationCap className="h-4 w-4 text-teal" aria-hidden />
                  Qualifications
                </p>
                <ul className="space-y-1.5" role="list">
                  {QUALIFICATIONS.map((q) => (
                    <li key={q.label} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                      <span>
                        <strong className="font-semibold">{q.label}</strong>
                        <span className="text-muted-foreground"> — {q.institution}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <MagicButton href="/book" size="lg">
                Book a Consultation
              </MagicButton>
            </motion.div>
          </div>
        </div>
      </AuroraBackground>

      {/* ── Timeline ── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="timeline-heading">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-teal">
              Journey
            </span>
            <h2 id="timeline-heading" className="font-display text-3xl font-bold sm:text-4xl">
              A Career Built on Care
            </h2>
          </motion.div>

          <div role="list" aria-label="Career milestones">
            {TIMELINE.map((item, i) => (
              <div key={`${item.year}-${item.title}`} role="listitem">
                <TimelineItem {...item} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Specialties + Languages + Affiliations ── */}
      <section
        className="bg-muted/30 px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="specialties-heading"
      >
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
          >
            <h2
              id="specialties-heading"
              className="font-display mb-2 flex items-center gap-2 text-2xl font-bold"
            >
              <Award className="h-6 w-6 text-teal" aria-hidden />
              Areas of Specialisation
            </h2>
            <p className="mb-6 text-muted-foreground">
              Comprehensive expertise across all aspects of women&apos;s reproductive health.
            </p>
            <div className="flex flex-wrap gap-2.5" role="list" aria-label="Specialties">
              {SPECIALTIES.map((s) => (
                <Badge
                  key={s}
                  role="listitem"
                  variant="secondary"
                  className="rounded-full px-4 py-1.5 text-sm font-medium"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-10 sm:grid-cols-2">
            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
            >
              <h3 className="font-display mb-4 flex items-center gap-2 text-xl font-semibold">
                <Languages className="h-5 w-5 text-violet" aria-hidden />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2.5" role="list">
                {LANGUAGES.map((l) => (
                  <Badge
                    key={l}
                    role="listitem"
                    className="rounded-full bg-violet/10 px-4 py-1.5 text-sm font-medium text-violet hover:bg-violet/15"
                  >
                    {l}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Affiliations */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
            >
              <h3 className="font-display mb-4 flex items-center gap-2 text-xl font-semibold">
                <Building2 className="h-5 w-5 text-teal" aria-hidden />
                Affiliations
              </h3>
              <ul className="space-y-2" role="list">
                {AFFILIATIONS.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
          className="space-y-4"
        >
          <h2 className="font-display text-2xl font-bold">Ready to book a consultation?</h2>
          <p className="text-muted-foreground">
            Same-day slots available · Instant confirmation · Google Meet
          </p>
          <MagicButton href="/book" size="lg">
            Book with Dr. Greeshma
          </MagicButton>
        </motion.div>
      </section>
    </>
  );
}
