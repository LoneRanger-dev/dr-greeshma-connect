import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Radial gradient blobs for atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 size-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--teal) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 size-[360px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--violet) 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 rounded-lg"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-violet shadow-glow">
          <Stethoscope className="h-5 w-5 text-white" />
        </span>
        <span className="font-display text-xl font-bold">
          Dr.{" "}
          <span className="bg-gradient-to-r from-teal to-violet bg-clip-text text-transparent">
            Greeshma
          </span>
        </span>
      </Link>

      {children}
    </div>
  );
}
