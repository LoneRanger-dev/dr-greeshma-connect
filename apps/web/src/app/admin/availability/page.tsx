"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Suspense } from "react";
import { toast } from "sonner";
import { api, type AvailabilityRule } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicButton } from "@/components/ui/magic-button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const INTERVALS = [
  { value: "10", label: "10 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "60", label: "60 min" },
];

const ruleSchema = z.object({
  weekday:         z.coerce.number().min(0).max(6),
  startTime:       z.string().regex(/^\d{2}:\d{2}$/, "HH:MM format required"),
  endTime:         z.string().regex(/^\d{2}:\d{2}$/, "HH:MM format required"),
  slotIntervalMin: z.coerce.number().refine((v) => [10, 15, 30, 60].includes(v), "Choose 10, 15, 30, or 60"),
});

type RuleForm = z.infer<typeof ruleSchema>;

function computeSlotCount(start: string, end: string, interval: number, duration: number): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  if (endMin <= startMin || interval <= 0) return 0;
  let count = 0;
  for (let offset = startMin; offset + duration <= endMin; offset += interval) count++;
  return count;
}

function RuleFormDialog({
  open,
  onClose,
  token,
  editRule,
}: {
  open:     boolean;
  onClose:  () => void;
  token:    string;
  editRule: AvailabilityRule | null;
}) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RuleForm>({
    resolver: zodResolver(ruleSchema),
    defaultValues: editRule
      ? {
          weekday:         editRule.weekday,
          startTime:       editRule.startTime,
          endTime:         editRule.endTime,
          slotIntervalMin: editRule.slotIntervalMin,
        }
      : { weekday: 1, startTime: "09:00", endTime: "18:00", slotIntervalMin: 30 },
  });

  const [startTime, endTime, interval] = watch(["startTime", "endTime", "slotIntervalMin"]);
  const slotPreview = computeSlotCount(startTime, endTime, Number(interval), Number(interval));

  const create = useMutation({
    mutationFn: (data: RuleForm) => api.post("/admin/availability-rules", data, token),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "availability-rules"] }); toast.success("Rule created"); onClose(); reset(); },
    onError:    (err: { error?: string }) => toast.error(err?.error ?? "Failed to create rule"),
  });

  const update = useMutation({
    mutationFn: (data: RuleForm) => api.patch(`/admin/availability-rules/${editRule!.id}`, data, token),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "availability-rules"] }); toast.success("Rule updated"); onClose(); },
    onError:    (err: { error?: string }) => toast.error(err?.error ?? "Failed to update rule"),
  });

  function onSubmit(data: RuleForm) {
    if (editRule) update.mutate(data);
    else create.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit rule" : "New availability rule"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Day of week</label>
            <Select
              value={String(watch("weekday"))}
              onValueChange={(v) => setValue("weekday", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((d, i) => (
                  <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Start time (IST)</label>
              <Input {...register("startTime")} type="time" />
              {errors.startTime && <p className="mt-1 text-xs text-destructive">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">End time (IST)</label>
              <Input {...register("endTime")} type="time" />
              {errors.endTime && <p className="mt-1 text-xs text-destructive">{errors.endTime.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Slot interval</label>
            <Select
              value={String(watch("slotIntervalMin"))}
              onValueChange={(v) => setValue("slotIntervalMin", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {slotPreview > 0 && (
            <p className="rounded-lg bg-teal/10 px-3 py-2 text-xs text-teal">
              This rule generates <strong>{slotPreview} slots</strong> per day
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <MagicButton type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </MagicButton>
            <MagicButton type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editRule ? "Update" : "Create"}
            </MagicButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Google Calendar status card ──────────────────────────────────────────────

function GoogleCalendarCard({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const googleParam  = searchParams.get("google");

  const { data, isLoading, refetch } = useQuery({
    queryKey:  ["google", "status"],
    queryFn:   () => api.get<{ data: { connected: boolean; source: "env" | "db" | null } }>("/google/status", token),
    enabled:   !!token,
    staleTime: 30_000,
  });

  // Auto-refresh after OAuth redirect
  useEffect(() => {
    if (googleParam === "connected") {
      refetch();
      toast.success("Google Calendar connected!");
    } else if (googleParam === "error") {
      toast.error("Google Calendar connection failed. Please try again.");
    } else if (googleParam === "no_refresh_token") {
      toast.error("No refresh token returned. Please revoke access at myaccount.google.com and try again.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleParam]);

  const { data: urlData, isLoading: urlLoading } = useQuery({
    queryKey:  ["google", "auth-url"],
    queryFn:   () => api.get<{ data: { url: string } }>("/google/auth-url", token),
    enabled:   !!token,
    staleTime: Infinity,
  });

  const connected = data?.data?.connected ?? false;
  const source    = data?.data?.source;

  return (
    <GlassCard className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${connected ? "bg-teal/10" : "bg-muted/40"}`}>
          <CalendarDays className={`size-5 ${connected ? "text-teal" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Google Calendar</p>
          <p className="text-xs text-muted-foreground">Auto-creates Meet links on appointment confirmation</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-5 w-32 animate-pulse rounded bg-muted/40" />
      ) : (
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <CheckCircle2 className="size-4 text-teal" />
              <span className="text-sm text-teal">
                Connected{source === "env" ? " via environment variable" : " via OAuth"}
              </span>
            </>
          ) : (
            <>
              <XCircle className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Not connected</span>
            </>
          )}
        </div>
      )}

      {!connected && (
        <div className="flex flex-col gap-2">
          <a
            href={urlData?.data?.url}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
              ${urlData?.data?.url
                ? "bg-teal text-white hover:bg-teal/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"}`}
            target="_self"
            aria-disabled={!urlData?.data?.url || urlLoading}
            onClick={(e) => { if (!urlData?.data?.url) e.preventDefault(); }}
          >
            <ExternalLink className="size-4" />
            {urlLoading ? "Loading…" : "Connect Google Calendar"}
          </a>
          <p className="text-xs text-muted-foreground">
            You&apos;ll be redirected to Google to grant calendar access.
          </p>
        </div>
      )}

      {connected && source === "db" && (
        <p className="text-xs text-muted-foreground">
          To disconnect, revoke access at{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal underline underline-offset-2"
          >
            myaccount.google.com/permissions
          </a>
          .
        </p>
      )}
    </GlassCard>
  );
}

export default function AdminAvailabilityPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";
  const qc    = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRule,   setEditRule]   = useState<AvailabilityRule | null>(null);

  const { data, isLoading } = useQuery({
    queryKey:  ["admin", "availability-rules"],
    queryFn:   () => api.get<{ data: AvailabilityRule[] }>("/admin/availability-rules", token),
    enabled:   !!token,
    staleTime: 60_000,
  });

  const deleteRule = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/availability-rules/${id}`, token),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "availability-rules"] }); toast.success("Rule deleted"); },
    onError:    (err: { error?: string }) => toast.error(err?.error ?? "Failed to delete"),
  });

  const rules = data?.data ?? [];

  // Group rules by weekday for the weekly grid
  const byWeekday: Record<number, AvailabilityRule[]> = {};
  for (const rule of rules) {
    (byWeekday[rule.weekday] ??= []).push(rule);
  }

  function openEdit(rule: AvailabilityRule) {
    setEditRule(rule);
    setDialogOpen(true);
  }

  function openCreate() {
    setEditRule(null);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Availability</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your weekly schedule</p>
        </div>
        <MagicButton size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          Add rule
        </MagicButton>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {WEEKDAYS.map((day, idx) => {
            const dayRules = byWeekday[idx] ?? [];
            return (
              <GlassCard key={idx} className="flex flex-col gap-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</p>
                {dayRules.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60">No availability</p>
                ) : (
                  dayRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between gap-2 rounded-lg bg-teal/5 px-3 py-2">
                      <div>
                        <p className="text-xs font-medium text-teal">
                          {rule.startTime} – {rule.endTime}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{rule.slotIntervalMin} min slots</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(rule)}
                          className="flex size-6 items-center justify-center rounded hover:bg-teal/20 text-muted-foreground hover:text-teal"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          onClick={() => deleteRule.mutate(rule.id)}
                          className="flex size-6 items-center justify-center rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {rules.length === 0 && !isLoading && (
        <GlassCard className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-muted-foreground">No availability rules set.</p>
          <MagicButton size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 size-4" />
            Add your first rule
          </MagicButton>
        </GlassCard>
      )}

      {/* Google Calendar integration */}
      <div className="mt-2">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Integrations
        </h2>
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl" />}>
          <GoogleCalendarCard token={token} />
        </Suspense>
      </div>

      <RuleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        token={token}
        editRule={editRule}
      />
    </div>
  );
}
