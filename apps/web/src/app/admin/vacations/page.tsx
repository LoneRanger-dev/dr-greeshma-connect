"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DayPicker } from "react-day-picker";
import { format, addMonths } from "date-fns";
import { Trash2, CalendarOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, type BlockedDate } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicButton } from "@/components/ui/magic-button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminVacationsPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";
  const qc    = useQueryClient();

  const today     = new Date();
  const maxDate   = addMonths(today, 6);

  const [selected, setSelected] = useState<Date[]>([]);
  const [reason,   setReason]   = useState("");

  const { data, isLoading } = useQuery({
    queryKey:  ["admin", "blocked-dates"],
    queryFn:   () => api.get<{ data: BlockedDate[] }>("/admin/blocked-dates", token),
    enabled:   !!token,
    staleTime: 60_000,
  });

  const blockedDates = data?.data ?? [];
  const blockedSet   = new Set(blockedDates.map((d) => d.date));

  const addBlocked = useMutation({
    mutationFn: (dates: string[]) =>
      api.post("/admin/blocked-dates", { dates, reason: reason.trim() || null }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blocked-dates"] });
      toast.success(`${selected.length} date(s) blocked`);
      setSelected([]);
      setReason("");
    },
    onError: (err: { error?: string }) => toast.error(err?.error ?? "Failed to block dates"),
  });

  const removeBlocked = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/blocked-dates/${id}`, token),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "blocked-dates"] }); toast.success("Date unblocked"); },
    onError:    (err: { error?: string }) => toast.error(err?.error ?? "Failed to unblock"),
  });

  function handleBlock() {
    const dates = selected.map((d) => format(d, "yyyy-MM-dd"));
    const newDates = dates.filter((d) => !blockedSet.has(d));
    if (!newDates.length) { toast.info("All selected dates are already blocked"); return; }
    addBlocked.mutate(newDates);
  }

  // Disable already-blocked and past dates in the picker
  const disabledDays = blockedDates.map((d) => new Date(d.date + "T00:00:00"));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Vacations & Holidays</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Block dates on which no appointments will be available
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Calendar picker */}
        <GlassCard className="p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Select dates to block</p>
          <DayPicker
            mode="multiple"
            selected={selected}
            onSelect={(days) => setSelected(days ?? [])}
            disabled={[{ before: today }, ...disabledDays]}
            startMonth={today}
            endMonth={maxDate}
            classNames={{
              root:            "text-sm",
              months:          "flex gap-4",
              month_grid:      "mt-2 w-full border-collapse",
              weekdays:        "flex",
              weekday:         "text-muted-foreground w-9 text-center text-[0.8rem] font-normal",
              weeks:           "mt-1",
              week:            "flex mt-1",
              day:             "relative p-0 text-center text-sm",
              day_button:      "size-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
              selected:        "[&>button]:bg-teal [&>button]:text-white [&>button]:hover:bg-teal",
              today:           "[&>button]:font-bold [&>button]:border [&>button]:border-teal/50",
              disabled:        "[&>button]:opacity-30 [&>button]:cursor-not-allowed",
              outside:         "opacity-30",
              nav:             "flex items-center gap-1 mb-2",
              button_previous: "flex size-7 items-center justify-center rounded hover:bg-muted",
              button_next:     "flex size-7 items-center justify-center rounded hover:bg-muted",
              month_caption:   "flex items-center justify-between text-sm font-semibold text-foreground",
            }}
          />

          {selected.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                {selected.length} date(s) selected
              </p>
              <Input
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <MagicButton
                size="sm"
                onClick={handleBlock}
                disabled={addBlocked.isPending}
              >
                <CalendarOff className="mr-1.5 size-4" />
                {addBlocked.isPending ? "Blocking…" : "Block selected dates"}
              </MagicButton>
            </div>
          )}
        </GlassCard>

        {/* Blocked dates list */}
        <GlassCard className="flex flex-col gap-3 p-5">
          <p className="text-sm font-semibold text-foreground">Blocked dates</p>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
              <Plus className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No dates blocked yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-1">
              {blockedDates.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-rose-500/5 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(d.date + "T00:00:00"), "EEEE, dd MMMM yyyy")}
                    </p>
                    {d.reason && (
                      <p className="truncate text-xs text-muted-foreground">{d.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlocked.mutate(d.id)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
