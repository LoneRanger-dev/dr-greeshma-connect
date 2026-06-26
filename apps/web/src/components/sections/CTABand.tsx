"use client";

import { motion } from "framer-motion";
import { ArrowRight, Video } from "lucide-react";
import { SITE } from "@/config/site";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { MagicButton } from "@/components/ui/magic-button";

export function CTABand() {
  return (
    <section aria-labelledby="cta-heading" className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <AuroraBackground dark className="rounded-3xl bg-slate-900">
          <div className="px-8 py-16 text-center sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, ease: [0.19, 1, 0.22, 1] }}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/15 px-4 py-1.5 text-sm font-medium text-teal">
                <Video className="h-4 w-4" aria-hidden />
                Telehealth · Secure · Private
              </span>

              <h2
                id="cta-heading"
                className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              >
                Take the First Step Towards{" "}
                <span className="bg-gradient-to-r from-teal via-violet to-rose-gold bg-clip-text text-transparent">
                  Better Health
                </span>
              </h2>

              <p className="mx-auto max-w-lg text-lg text-white/70">
                Join 8,000+ women who have trusted {SITE.shortName} for expert, compassionate
                care — from wherever you are in India.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
                {/* Gradient border wrapper — the ::before rotates the brand colours */}
                <div className="animate-gradient-border rounded-2xl">
                  <MagicButton href="/book" size="lg">
                    Book Your Consultation
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </MagicButton>
                </div>
                <MagicButton href="/services" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Learn About Services
                </MagicButton>
              </div>

              <p className="text-sm text-white/50">
                Instant confirmation · Google Meet link · No waiting rooms
              </p>
            </motion.div>
          </div>
        </AuroraBackground>
      </div>
    </section>
  );
}
