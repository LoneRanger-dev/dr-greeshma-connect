"use client";

import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfToday, parseISO } from "date-fns";
import { api, type AvailabilityResponse, type ApiService } from "@/lib/api";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { MagicButton } from "@/components/ui/magic-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  service:  ApiService;
  selected: string | null; // "YYYY-MM-DD"
  onSelect: (date: string) => void;
  onNext:   () => void;
  onBack:   () => void;
}

export function StepDate({ service, selected, onSelect, onNext, onBack }: Props) {
  const today = startOfToday();
  const from  = format(today, "yyyy-MM-dd");
  const to    = format(addDays(today, 30), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey:  ["availability", service.id],
    queryFn:   () => api.get<AvailabilityResponse>(`/slots/availability?from=${from}&to=${to}`),
    staleTime: 60_000,
  });

  const availableSet = new Set(data?.data.availableDates ?? []);

  const availableDays = Array.from(availableSet).map((d) => parseISO(d));

  const selectedDate = selected ? parseISO(selected) : undefined;

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const str = format(date, "yyyy-MM-dd");
    if (availableSet.has(str)) onSelect(str);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Choose a date
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dates with available slots are highlighted.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="mx-auto h-72 w-72 rounded-2xl" />
      ) : (
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date) =>
              !availableSet.has(format(date, "yyyy-MM-dd")) ||
              date < today
            }
            startMonth={today}
            endMonth={addDays(today, 30)}
            modifiers={{ available: availableDays }}
            components={{
              DayButton: ({ day, modifiers, children, ...props }) => (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {modifiers.available && !modifiers.disabled && (
                    <span
                      className={cn(
                        "size-1 rounded-full",
                        modifiers.selected
                          ? "bg-primary-foreground"
                          : "bg-teal",
                      )}
                    />
                  )}
                </CalendarDayButton>
              ),
            }}
            className="rounded-2xl border border-border/40 bg-card/60 p-4 backdrop-blur"
          />
        </div>
      )}

      {availableSet.size === 0 && !isLoading && (
        <p className="text-center text-sm text-muted-foreground">
          No available dates in the next 30 days.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <MagicButton variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
          Back
        </MagicButton>
        <MagicButton
          disabled={!selected}
          onClick={onNext}
          className="flex-1 sm:flex-none sm:w-auto"
        >
          Continue — Pick a time
        </MagicButton>
      </div>
    </div>
  );
}
