"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { api, type SlotsResponse, type SlotInfo, type ApiService } from "@/lib/api";
import { MagicButton } from "@/components/ui/magic-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, cn } from "@/lib/utils";
import { parseISO } from "date-fns";

interface Props {
  service:  ApiService;
  date:     string; // "YYYY-MM-DD"
  selected: SlotInfo | null;
  onSelect: (slot: SlotInfo) => void;
  onNext:   () => void;
  onBack:   () => void;
}

function to12h(label: string): string {
  const [h, m] = label.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const h12    = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function StepTime({ service, date, selected, onSelect, onNext, onBack }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey:       ["slots", date, service.id],
    queryFn:        () => api.get<SlotsResponse>(`/slots?date=${date}&serviceId=${service.id}`),
    staleTime:      10_000,
    refetchInterval: 15_000,
  });

  const slots = data?.data.slots ?? [];

  const morning   = slots.filter((s) => parseInt(s.label) < 12);
  const afternoon = slots.filter((s) => { const h = parseInt(s.label); return h >= 12 && h < 17; });
  const evening   = slots.filter((s) => parseInt(s.label) >= 17);

  const groups = [
    { label: "Morning",   items: morning },
    { label: "Afternoon", items: afternoon },
    { label: "Evening",   items: evening },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Choose a time
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(parseISO(date))} · IST{" "}
          {isFetching && !isLoading && (
            <span className="ml-1 text-teal/70">↻ refreshing</span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card/40 p-8 text-center">
          <Clock className="mx-auto mb-3 size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No slots available for this date.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Please go back and pick another day.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((slot) => {
                  const isChosen = selected?.startsAt === slot.startsAt;
                  return (
                    <button
                      key={slot.startsAt}
                      onClick={() => onSelect(slot)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60",
                        isChosen
                          ? "border-teal bg-teal text-white shadow-glow"
                          : "border-border/50 bg-card/60 text-foreground hover:border-teal/50 hover:bg-teal/5",
                      )}
                    >
                      {to12h(slot.label)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <MagicButton variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
          Back
        </MagicButton>
        <MagicButton
          disabled={!selected}
          onClick={onNext}
          className="flex-1 sm:flex-none"
        >
          Continue — Your details
        </MagicButton>
      </div>
    </div>
  );
}
