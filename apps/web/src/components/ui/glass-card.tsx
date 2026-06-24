"use client";

import { forwardRef, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?:  boolean;
  tilt?:  boolean;
}

// Max tilt angle in degrees
const MAX_TILT = 6;

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, tilt = false, children, ...props }, ref) => {
    const reduced = useReducedMotion();

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 180, damping: 22 });
    const springY = useSpring(rotateY, { stiffness: 180, damping: 22 });

    const innerRef = useRef<HTMLDivElement>(null);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || reduced) return;
      const el   = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      rotateX.set(-y * MAX_TILT);
      rotateY.set( x * MAX_TILT);
    }, [tilt, reduced, rotateX, rotateY]);

    const onMouseLeave = useCallback(() => {
      rotateX.set(0);
      rotateY.set(0);
    }, [rotateX, rotateY]);

    const baseClass = cn(
      "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
      "shadow-[0_8px_32px_oklch(0_0_0_/_0.12),inset_0_1px_0_oklch(1_0_0_/_0.1)]",
      "dark:bg-white/5 dark:border-white/8",
      glow  && "shadow-[0_8px_32px_oklch(0_0_0_/_0.12),inset_0_1px_0_oklch(1_0_0_/_0.1),0_0_24px_oklch(0.636_0.131_185.7_/_0.2)]",
      hover && [
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        "hover:bg-white/15 dark:hover:bg-white/8",
        "hover:shadow-[0_16px_48px_oklch(0_0_0_/_0.18),inset_0_1px_0_oklch(1_0_0_/_0.15)]",
        "hover:border-white/30 dark:hover:border-white/15",
      ],
      className,
    );

    if (tilt && !reduced) {
      return (
        <motion.div
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={(node) => { (innerRef as any).current = node; if (typeof ref === "function") ref(node); else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node; }}
          className={baseClass}
          style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", willChange: "transform" }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClass} {...props}>
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
