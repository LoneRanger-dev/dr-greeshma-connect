"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { CalendarDays, TrendingUp, Clock, XCircle, Video } from "lucide-react";
import { format, parseISO } from "date-fns";
import { api, type AdminStats } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatTime } from "@/lib/utils";

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-amber-500/15 text-amber-600 border-amber-500/30",
  CONFIRMED:   "bg-teal/15 text-teal border-teal/30",
  COMPLETED:   "bg-green-500/15 text-green-600 border-green-500/30",
  CANCELLED:   "bg-rose-500/15 text-rose-600 border-rose-500/30",
  NO_SHOW:     "bg-slate-500/15 text-slate-500 border-slate-500/30",
  RESCHEDULED: "bg-violet/15 text-violet border-violet/30",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? ""}`}>
      {status}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  loading,
}: {
  label:    string;
  value:    number;
  prefix?:  string;
  suffix?:  string;
  icon:     React.ComponentType<{ className?: string }>;
  loading:  boolean;
}) {
  const displayed = useCountUp(loading ? 0 : value);

  return (
    <GlassCard className="flex items-start gap-4 p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal/10">
        <Icon className="size-5 text-teal" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-7 w-20" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold text-foreground tabular-nums">
            {prefix}{displayed.toLocaleString("en-IN")}{suffix}
          </p>
        )}
      </div>
    </GlassCard>
  );
}

// ── Chart colors ──────────────────────────────────────────────────────────────

const DONUT_COLORS = ["#14b8a6", "#7c3aed", "#f43f5e", "#f59e0b", "#3b82f6"];

// ── Dashboard page ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session } = useSession();
  const token = session?.backendToken;

  const { data, isLoading } = useQuery({
    queryKey:  ["admin", "stats"],
    queryFn:   () => api.get<{ data: AdminStats }>("/admin/stats", token),
    enabled:   !!token,
    staleTime: 30_000,
  });

  const stats = data?.data;

  const revenueData = stats?.revenueByDay.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "dd MMM"),
  })) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Today's Appointments"
          value={stats?.todayAppointments ?? 0}
          icon={CalendarDays}
          loading={isLoading}
        />
        <StatCard
          label="Week Revenue"
          value={stats?.weekRevenue ?? 0}
          prefix="₹"
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard
          label="Upcoming (7 days)"
          value={stats?.upcomingAppointments ?? 0}
          icon={Clock}
          loading={isLoading}
        />
        <StatCard
          label="Cancellations (week)"
          value={stats?.cancellations ?? 0}
          icon={XCircle}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue line chart */}
        <GlassCard className="p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Revenue — last 7 days</p>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={192}>
              <LineChart data={revenueData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: "#14b8a6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {!isLoading && stats?.weekRevenue === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Revenue will appear here after payments are integrated (Step 12)
            </p>
          )}
        </GlassCard>

        {/* Service donut chart */}
        <GlassCard className="p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Appointments by service (this month)</p>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : stats?.appointmentsByService.length ? (
            <ResponsiveContainer width="100%" height={192}>
              <PieChart>
                <Pie
                  data={stats.appointmentsByService}
                  dataKey="count"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {stats.appointmentsByService.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">No appointments this month yet</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Upcoming appointments list */}
      <GlassCard className="p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Next upcoming appointments</p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : stats?.recentAppointments.length ? (
          <div className="flex flex-col divide-y divide-border/30">
            {stats.recentAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{appt.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{appt.service.title}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(appt.startsAt), "dd MMM")} · {formatTime(new Date(appt.startsAt))}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={appt.status} />
                    {appt.meetLink && (
                      <a
                        href={appt.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-teal/10 text-teal hover:bg-teal/20 transition-colors"
                      >
                        <Video className="size-2.5" />
                        Join
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            No upcoming appointments
          </p>
        )}
      </GlassCard>
    </div>
  );
}
