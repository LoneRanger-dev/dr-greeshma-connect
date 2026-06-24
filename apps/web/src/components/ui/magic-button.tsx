"use client";

import { motion } from "framer-motion";
import NextLink from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Ripple { id: number; x: number; y: number }

type BaseProps = {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type LinkProps = BaseProps & {
  href: string;
  target?: string;
  rel?: string;
};

export type MagicButtonProps = ButtonProps | LinkProps;

const MotionLink = motion(NextLink);

const variantStyles = {
  primary: [
    "bg-gradient-to-r from-teal via-teal to-violet text-white",
    "shadow-[0_0_20px_oklch(0.636_0.131_185.7_/_0.35)]",
    "hover:shadow-[0_0_30px_oklch(0.636_0.131_185.7_/_0.55),0_0_60px_oklch(0.636_0.131_185.7_/_0.2)]",
    "focus-visible:ring-teal",
  ].join(" "),
  outline: [
    "border-2 border-teal bg-transparent text-teal",
    "hover:bg-teal/8 hover:shadow-[0_0_16px_oklch(0.636_0.131_185.7_/_0.25)]",
    "focus-visible:ring-teal",
  ].join(" "),
  ghost: [
    "bg-transparent text-violet",
    "hover:bg-violet/8",
    "focus-visible:ring-violet",
  ].join(" "),
};

const sizeStyles = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-6 text-base rounded-xl",
  lg: "h-14 px-8 text-lg rounded-2xl",
};

const baseClass =
  "relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function Internals({
  variant,
  isLoading,
  children,
  ripples,
}: {
  variant: "primary" | "outline" | "ghost";
  isLoading?: boolean;
  children: React.ReactNode;
  ripples: Ripple[];
}) {
  return (
    <>
      {variant === "primary" && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)",
            willChange: "transform",
          }}
          variants={{
            rest: { x: "-120%" },
            hover: { x: "220%", transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] } },
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
          </svg>
        )}
        {children}
      </span>
      {ripples.map(({ id, x, y }) => (
        <motion.span
          key={id}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-white/25"
          style={{ left: x, top: y }}
          initial={{ width: 0, height: 0, x: "-50%", y: "-50%", opacity: 0.6 }}
          animate={{ width: 220, height: 220, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        />
      ))}
    </>
  );
}

export function MagicButton(props: MagicButtonProps) {
  const {
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
  } = props;

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const ref = useRef<HTMLElement>(null);

  function addRipple(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((p) => p.filter((r) => r.id !== id)), 700);
  }

  const cls = cn(baseClass, variantStyles[variant], sizeStyles[size], className);
  const motionProps = {
    whileTap: isLoading ? {} : { scale: 0.97 },
    whileHover: "hover",
    initial: "rest",
  } as const;

  if ("href" in props) {
    const { href, target, rel } = props;
    return (
      <MotionLink
        href={href}
        target={target}
        rel={rel}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        className={cls}
        onClick={addRipple}
        {...motionProps}
      >
        <Internals variant={variant} isLoading={isLoading} ripples={ripples}>
          {children}
        </Internals>
      </MotionLink>
    );
  }

  // Destructure all custom props so they never reach the DOM
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { disabled, onClick, variant: _v, size: _s, isLoading: _l, children: _c, className: _cls, ...rest } = props as ButtonProps;
  return (
    <motion.button
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cls}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={(e) => { addRipple(e); onClick?.(e); }}
      {...motionProps}
      {...(rest as object)}
    >
      <Internals variant={variant} isLoading={isLoading} ripples={ripples}>
        {children}
      </Internals>
    </motion.button>
  );
}
