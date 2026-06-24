"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { MoreHorizontal, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { api, type AppointmentSummary } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTime } from "@/lib/utils";

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

function CopyMeetLink({ link }: { link: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!link) return <span className="text-xs text-muted-foreground/50">—</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1 text-xs text-teal hover:underline"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function RowActions({ appt, token }: { appt: AppointmentSummary; token: string }) {
  const qc = useQueryClient();

  const mutate = useMutation({
    mutationFn: (action: string) => api.patch(`/appointments/${appt.id}/${action}`, {}, token),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "appointments"] }); toast.success("Appointment updated"); },
    onError:    (err: { error?: string }) => toast.error(err?.error ?? "Action failed"),
  });

  const cancel = useMutation({
    mutationFn: () => api.patch(`/appointments/${appt.id}/cancel`, {}, token),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["admin", "appointments"] }); toast.success("Appointment cancelled"); },
    onError:    (err: { error?: string }) => toast.error(err?.error ?? "Cancel failed"),
  });

  const canConfirm  = ["PENDING", "RESCHEDULED"].includes(appt.status);
  const canComplete = appt.status === "CONFIRMED";
  const canNoShow   = appt.status === "CONFIRMED";
  const canCancel   = !["CANCELLED", "COMPLETED"].includes(appt.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {canConfirm  && <DropdownMenuItem onClick={() => mutate.mutate("confirm")}>Confirm</DropdownMenuItem>}
        {canComplete && <DropdownMenuItem onClick={() => mutate.mutate("complete")}>Mark completed</DropdownMenuItem>}
        {canNoShow   && <DropdownMenuItem onClick={() => mutate.mutate("no-show")}>Mark no-show</DropdownMenuItem>}
        {(canConfirm || canComplete || canNoShow) && canCancel && <DropdownMenuSeparator />}
        {canCancel && (
          <DropdownMenuItem className="text-rose-600 focus:text-rose-600" onClick={() => cancel.mutate()}>
            Cancel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppointmentCard({ appt, token }: { appt: AppointmentSummary; token: string }) {
  return (
    <GlassCard className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{appt.patientName}</p>
          <p className="text-xs text-muted-foreground">{appt.patientEmail}</p>
        </div>
        <RowActions appt={appt} token={token} />
      </div>
      <p className="text-xs text-muted-foreground">
        {appt.service.title} · {format(parseISO(appt.startsAt), "dd MMM")} {formatTime(new Date(appt.startsAt))}
      </p>
      <div className="flex items-center justify-between">
        <StatusBadge status={appt.status} />
        <CopyMeetLink link={appt.meetLink} />
      </div>
    </GlassCard>
  );
}

const STATUS_OPTIONS = [
  { value: "ALL",         label: "All statuses"  },
  { value: "PENDING",     label: "Pending"       },
  { value: "CONFIRMED",   label: "Confirmed"     },
  { value: "COMPLETED",   label: "Completed"     },
  { value: "CANCELLED",   label: "Cancelled"     },
  { value: "NO_SHOW",     label: "No-show"       },
  { value: "RESCHEDULED", label: "Rescheduled"   },
];

const PAGE_SIZE = 15;

interface ApptsResponse {
  data: AppointmentSummary[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export default function AdminAppointmentsPage() {
  const { data: session } = useSession();
  const token = session?.backendToken ?? "";

  const [status, setStatus] = useState("ALL");
  const [page,   setPage]   = useState(1);

  const params = new URLSearchParams({
    page:     String(page),
    pageSize: String(PAGE_SIZE),
    ...(status !== "ALL" ? { status } : {}),
  });

  const { data, isLoading } = useQuery({
    queryKey:  ["admin", "appointments", status, page],
    queryFn:   () => api.get<ApptsResponse>(`/appointments?${params}`, token),
    enabled:   !!token,
    staleTime: 30_000,
  });

  const appointments = data?.data    ?? [];
  const pagination   = data?.pagination;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Appointments</h1>
          {pagination && (
            <p className="mt-0.5 text-sm text-muted-foreground">{pagination.total} total</p>
          )}
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <GlassCard className="p-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="m-2 h-12 w-full" />)}
        </GlassCard>
      ) : appointments.length === 0 ? (
        <GlassCard className="flex items-center justify-center p-16">
          <p className="text-muted-foreground">No appointments found</p>
        </GlassCard>
      ) : (
        <>
          <div className="hidden md:block">
            <GlassCard className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Service</TableHead>
                    <TableHead className="text-xs">Date / Time (IST)</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Meet</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id} className="border-border/30">
                      <TableCell>
                        <p className="text-sm font-medium">{appt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appt.patientEmail}</p>
                      </TableCell>
                      <TableCell className="text-sm">{appt.service.title}</TableCell>
                      <TableCell className="text-sm">
                        {format(parseISO(appt.startsAt), "dd MMM yyyy")}{" "}
                        <span className="text-muted-foreground">{formatTime(new Date(appt.startsAt))}</span>
                      </TableCell>
                      <TableCell><StatusBadge status={appt.status} /></TableCell>
                      <TableCell><CopyMeetLink link={appt.meetLink} /></TableCell>
                      <TableCell><RowActions appt={appt} token={token} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {appointments.map((appt) => (
              <AppointmentCard key={appt.id} appt={appt} token={token} />
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
