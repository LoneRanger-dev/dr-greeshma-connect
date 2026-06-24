"use client";

import { CalendarDays, Clock, Stethoscope } from "lucide-react";
import { parseISO } from "date-fns";
import { type ApiService, type SlotInfo } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { formatDate, formatINR, formatTime } from "@/lib/utils";

interface Props {
  service: ApiService | null;
  date:    string | null;
  slot:    SlotInfo | null;
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-teal/70" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground leading-tight">{value}</p>
      </div>
    </div>
  );
}

export function SummaryPanel({ service, date, slot }: Props) {
  if (!service && !date && !slot) {
    return (
      <GlassCard className="p-5 text-sm text-muted-foreground">
        Your booking summary will appear here as you complete each step.
      </GlassCard>
    );
  }

  return (
    <GlassCard glow className="flex flex-col gap-3.5 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal">
        Your booking
      </p>

      {service && (
        <Row icon={Stethoscope} label="Consultation" value={service.title} />
      )}
      {date && (
        <Row icon={CalendarDays} label="Date" value={formatDate(parseISO(date))} />
      )}
      {slot && (
        <Row icon={Clock} label="Time (IST)" value={formatTime(new Date(slot.startsAt))} />
      )}

      {service && (
        <>
          <hr className="border-border/30" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Duration</span>
            <span className="text-xs font-medium text-foreground">{service.durationMin} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Fee</span>
            <span className="text-sm font-semibold text-teal">{formatINR(service.priceInr)}</span>
          </div>
        </>
      )}
    </GlassCard>
  );
}
