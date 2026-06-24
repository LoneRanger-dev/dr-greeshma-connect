"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { api, type AdminPatient } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-amber-500/15 text-amber-600",
  CONFIRMED:   "bg-teal/15 text-teal",
  COMPLETED:   "bg-green-500/15 text-green-600",
  CANCELLED:   "bg-rose-500/15 text-rose-600",
  NO_SHOW:     "bg-slate-500/15 text-slate-500",
  RESCHEDULED: "bg-violet/15 text-violet",
};

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? ""}`}>
      {status}
    </span>
  );
}

function PatientRow({ patient }: { patient: AdminPatient }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-border/30 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">{patient.name}</p>
            <p className="text-xs text-muted-foreground">{patient.email}</p>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {patient.phone ?? <span className="text-muted-foreground/40">—</span>}
        </td>
        <td className="px-4 py-3 text-sm text-foreground tabular-nums">
          {patient._count.appointments}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {patient.appointments[0]
            ? format(parseISO(patient.appointments[0].startsAt), "dd MMM yyyy")
            : <span className="text-muted-foreground/40">—</span>
          }
        </td>
        <td className="px-4 py-3 text-right">
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </td>
      </tr>

      {expanded && patient.appointments.length > 0 && (
        <tr className="bg-muted/20">
          <td colSpan={5} className="px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent appointments
            </p>
            <div className="flex flex-col gap-1.5">
              {patient.appointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between gap-2 rounded-lg bg-background/50 px-3 py-2">
                  <p className="text-xs font-medium text-foreground">{appt.service.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(appt.startsAt), "dd MMM yyyy")}
                    </p>
                    <StatusChip status={appt.status} />
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function PatientCard({ patient }: { patient: AdminPatient }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard className="flex flex-col gap-2 p-4">
      <div
        className="flex items-start justify-between gap-2 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0">
          <p className="font-medium text-foreground">{patient.name}</p>
          <p className="text-xs text-muted-foreground">{patient.email}</p>
          {patient.phone && <p className="text-xs text-muted-foreground">{patient.phone}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {patient._count.appointments} appt{patient._count.appointments !== 1 ? "s" : ""}
          </span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </div>
      </div>

      {expanded && patient.appointments.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-border/30 pt-3">
          {patient.appointments.map((appt) => (
            <div key={appt.id} className="flex items-center justify-between gap-2">
              <p className="text-xs text-foreground">{appt.service.title}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(appt.startsAt), "dd MMM")}
                </p>
                <StatusChip status={appt.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

interface PatientsResponse {
  data: AdminPatient[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const PAGE_SIZE = 20;

export default function AdminPatientsPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";

  const [q,    setQ]    = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    page:     String(page),
    pageSize: String(PAGE_SIZE),
    ...(q ? { q } : {}),
  });

  const { data, isLoading } = useQuery({
    queryKey:  ["admin", "patients", q, page],
    queryFn:   () => api.get<PatientsResponse>(`/admin/patients?${params}`, token),
    enabled:   !!token,
    staleTime: 60_000,
  });

  const patients    = data?.data        ?? [];
  const pagination  = data?.pagination;

  function handleSearch(value: string) {
    setQ(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Patients</h1>
          {pagination && (
            <p className="mt-0.5 text-sm text-muted-foreground">{pagination.total} registered</p>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, phone…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : patients.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 p-16 text-center">
          <Users className="size-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">{q ? "No patients match your search" : "No patients registered yet"}</p>
        </GlassCard>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <GlassCard className="overflow-hidden p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appointments</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last visit</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))}
                </tbody>
              </table>
            </GlassCard>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
