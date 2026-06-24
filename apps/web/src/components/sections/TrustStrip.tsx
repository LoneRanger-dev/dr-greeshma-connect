"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Award, Users, Star, Baby } from "lucide-react";

const STATS = [
  { icon: Award,  value: 15,   suffix: "+",  label: "Years Experience",  decimals: 0 },
  { icon: Users,  value: 8000, suffix: "+",  label: "Happy Patients",    decimals: 0 },
  { icon: Star,   value: 4.9,  suffix: "★",  label: "Patient Rating",    decimals: 1 },
  { icon: Baby,   value: 5000, suffix: "+",  label: "Safe Deliveries",   decimals: 0 },
];

function CountUp({
  target,
  suffix,
  decimals,
}: {
  target: number;
  suffix: string;
  decimals: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: [0.19, 1, 0.22, 1],
      onUpdate(v) {
        node.textContent =
          (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN")) +
          suffix;
      },
    });
    return controls.stop;
  }, [isInView, target, suffix, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0 ? `0.0${suffix}` : `0${suffix}`}
    </span>
  );
}

export function TrustStrip() {
  return (
    <section className="relative -mt-12 z-10 px-4 sm:px-6 lg:px-8" aria-label="Key statistics">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-[0_8px_40px_oklch(0_0_0_/_0.1)] backdrop-blur-xl dark:bg-slate-900/80 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, suffix, label, decimals }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 py-2 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal/15 to-violet/15">
                <Icon className="h-5 w-5 text-teal" aria-hidden />
              </span>
              <p className="font-display text-3xl font-bold text-foreground">
                <CountUp target={value} suffix={suffix} decimals={decimals} />
              </p>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
