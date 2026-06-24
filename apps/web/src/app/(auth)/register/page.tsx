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
import { api, type ApiError } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { MagicButton } from "@/components/ui/magic-button";
import { cn } from "@/lib/utils";

const schema = z.object({
  name:     z.string().min(2, "Full name is required"),
  email:    z.string().email("Enter a valid email address"),
  phone:    z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit({ name, email, phone, password }: FormData) {
    setLoading(true);
    try {
      // Register with the backend
      await api.post("/auth/register", { name, email, phone, password });

      // Auto sign-in via NextAuth so session is established
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created but sign-in failed. Please go to the login page.");
        router.push("/login");
        return;
      }

      toast.success("Account created! Welcome aboard.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        toast.error("An account with this email already exists.", {
          description: "Please sign in instead.",
          action: { label: "Sign in", onClick: () => router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`) },
        });
      } else {
        toast.error(apiErr.error ?? "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Book and manage your consultations
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {(
          [
            { name: "name",     label: "Full name",     type: "text",     placeholder: "Jane Doe",            autoComplete: "name" },
            { name: "email",    label: "Email address", type: "email",    placeholder: "jane@example.com",    autoComplete: "email" },
            { name: "phone",    label: "Phone number",  type: "tel",      placeholder: "+91 98765 43210",     autoComplete: "tel" },
            { name: "password", label: "Password",      type: "password", placeholder: "8+ characters",       autoComplete: "new-password" },
          ] as const
        ).map(({ name, label, type, placeholder, autoComplete }) => (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {label}
            </label>
            <Input
              {...register(name)}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              className={cn(errors[name] && "border-destructive")}
            />
            {errors[name] && (
              <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p>
            )}
          </div>
        ))}

        <MagicButton type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </MagicButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-teal hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
