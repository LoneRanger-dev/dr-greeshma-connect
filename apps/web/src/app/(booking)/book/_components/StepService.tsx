"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api, type ApiService } from "@/lib/api";
import { SERVICES } from "@/lib/services";
import { GlassCard } from "@/components/ui/glass-card";
import { MagicButton } from "@/components/ui/magic-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, cn } from "@/lib/utils";

interface Props {
  selected: ApiService | null;
  onSelect: (s: ApiService) => void;
  onNext:   () => void;
}

export function StepService({ selected, onSelect, onNext }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn:  () => api.get<{ data: ApiService[] }>("/services"),
    staleTime: Infinity,
  });

  const services = data?.data ?? [];

  // Merge API data (id) with frontend static data (Icon, gradient, etc.)
  const enriched = services.map((svc) => {
    const meta = SERVICES.find((s) => s.slug === svc.slug);
    return { ...svc, Icon: meta?.Icon, gradient: meta?.gradient ?? "", iconColor: meta?.iconColor ?? "", tagline: meta?.tagline ?? "" };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          What can we help you with?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a consultation type to get started.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {enriched.map((svc, i) => {
            const Icon      = svc.Icon;
            const isChosen  = selected?.id === svc.id;

            return (
              <motion.button
                key={svc.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                onClick={() => onSelect(svc)}
                className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 rounded-2xl"
              >
                <GlassCard
                  glow={isChosen}
                  className={cn(
                    "relative flex h-full flex-col gap-2 p-4 transition-all duration-300",
                    isChosen
                      ? "border-teal/60 shadow-glow ring-1 ring-teal/30"
                      : "hover:border-teal/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        svc.gradient || "bg-teal/10",
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn("size-5", svc.iconColor || "text-teal")}
                        />
                      )}
                    </div>

                    {isChosen && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-teal">
                        <Check className="size-3 text-white" />
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      {svc.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {svc.tagline}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {svc.durationMin} min
                    </span>
                    <span className="text-sm font-semibold text-teal">
                      {formatINR(svc.priceInr)}
                    </span>
                  </div>
                </GlassCard>
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <MagicButton
          disabled={!selected}
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          Continue — Pick a date
        </MagicButton>
      </div>
    </div>
  );
}
