"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, Stethoscope, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MagicButton } from "@/components/ui/magic-button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "#timings", label: "Timings" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/85 shadow-sm backdrop-blur-xl"
          : "bg-transparent",
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-violet shadow-[0_0_14px_oklch(0.636_0.131_185.7_/_0.4)]">
            <Stethoscope className="h-5 w-5 text-white" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold leading-none">
            Dr.{" "}
            <span className="bg-gradient-to-r from-teal to-violet bg-clip-text text-transparent">
              Greeshma
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="relative text-sm font-medium text-foreground/70 transition-colors hover:text-teal focus-visible:outline-none focus-visible:text-teal"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <MagicButton href="/book" size="sm">
            Book Appointment
          </MagicButton>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[360px]">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex flex-col gap-8 pt-6">
              {/* Mobile logo */}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-violet">
                  <Stethoscope className="h-4 w-4 text-white" aria-hidden />
                </span>
                <span className="font-display text-base font-bold">
                  Dr.{" "}
                  <span className="bg-gradient-to-r from-teal to-violet bg-clip-text text-transparent">
                    Greeshma
                  </span>
                </span>
              </Link>

              {/* Mobile nav links */}
              <nav>
                <ul className="flex flex-col gap-1" role="list">
                  {NAV_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-teal/8 hover:text-teal"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <MagicButton href="/book" className="w-full">
                Book Appointment
              </MagicButton>

              <p className="text-center text-xs text-muted-foreground">
                Mon–Sat · 9 AM – 6 PM IST
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
