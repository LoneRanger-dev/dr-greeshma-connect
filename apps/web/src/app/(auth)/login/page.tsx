"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { MagicButton } from "@/components/ui/magic-button";
import { cn } from "@/lib/utils";

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit({ email, password }: FormData) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Incorrect email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage your appointments
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email address
          </label>
          <Input
            {...register("email")}
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <Input
            {...register("password")}
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            className={cn(errors.password && "border-destructive")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <MagicButton type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </MagicButton>

        {/* Google button — wired but disabled until Step 11 creds are added */}
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border/50 bg-card/50 px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
          title="Google sign-in available after Step 11 setup"
        >
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-teal hover:underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </GlassCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
