"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  /** Use a darker base gradient for hero/dark sections */
  dark?: boolean;
}

export function AuroraBackground({
  children,
  className,
  dark = false,
}: AuroraBackgroundProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {/* Always-visible static gradient base */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          dark
            ? "bg-gradient-to-br from-teal/20 via-violet/15 to-rose-gold/10"
            : "bg-gradient-to-br from-teal/10 via-violet/8 to-rose-gold/8",
        )}
      />

      {/* Animated blobs — disabled for prefers-reduced-motion */}
      {!prefersReduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* Teal blob — top-left */}
          <motion.div
            className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-teal/25 blur-[80px]"
            animate={{ x: [0, 50, 20, 0], y: [0, 30, 60, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Violet blob — top-right */}
          <motion.div
            className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-violet/20 blur-[100px]"
            animate={{ x: [0, -40, -10, 0], y: [0, 50, 20, 0], scale: [1, 1.15, 1.05, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
          {/* Rose-gold blob — bottom-center */}
          <motion.div
            className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-rose-gold/20 blur-[70px]"
            animate={{ x: [0, 30, -20, 0], y: [0, -30, -50, 0], scale: [1, 1.08, 0.98, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
          {/* Small bright teal accent */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/15 blur-[50px]"
            animate={{ scale: [1, 1.3, 0.9, 1], opacity: [0.6, 1, 0.7, 0.6] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
