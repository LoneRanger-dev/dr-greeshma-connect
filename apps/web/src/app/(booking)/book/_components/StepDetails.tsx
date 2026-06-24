"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MagicButton } from "@/components/ui/magic-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const schema = z.object({
  name:     z.string().min(2, "Full name is required"),
  email:    z.string().email("Enter a valid email address"),
  phone:    z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type PatientDetails = z.infer<typeof schema>;

interface Props {
  initial: PatientDetails | null;
  onNext:  (data: PatientDetails) => void;
  onBack:  () => void;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

export function StepDetails({ initial, onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientDetails>({
    resolver:      zodResolver(schema),
    defaultValues: initial ?? { name: "", email: "", phone: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Your details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll use these to confirm your appointment and send reminders.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Full name
          </label>
          <Input
            {...register("name")}
            placeholder="Jane Doe"
            className={cn(errors.name && "border-destructive")}
          />
          <FieldError msg={errors.name?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email address
          </label>
          <Input
            {...register("email")}
            type="email"
            placeholder="jane@example.com"
            className={cn(errors.email && "border-destructive")}
          />
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Phone number
          </label>
          <Input
            {...register("phone")}
            type="tel"
            placeholder="+91 98765 43210"
            className={cn(errors.phone && "border-destructive")}
          />
          <FieldError msg={errors.phone?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <Input
            {...register("password")}
            type="password"
            placeholder="Create a password (8+ chars)"
            className={cn(errors.password && "border-destructive")}
          />
          <FieldError msg={errors.password?.message} />
          <p className="mt-1 text-xs text-muted-foreground">
            Used to view and manage your appointments later.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <MagicButton
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none"
        >
          Back
        </MagicButton>
        <MagicButton
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          Review booking
        </MagicButton>
      </div>
    </form>
  );
}
