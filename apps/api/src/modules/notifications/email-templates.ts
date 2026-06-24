// Branded HTML email templates — "Dr. Greeshma Connect" premium theme
// Inline CSS only (email clients ignore <style> blocks).

const TEAL    = "#0EA5A4";
const TEAL_DK = "#0C8F8E";
const SLATE   = "#475569";
const BG      = "#F8FAFC";
const CARD_BG = "#FFFFFF";
const BORDER  = "#E2E8F0";
const RED     = "#EF4444";
const AMBER   = "#F59E0B";

// ── Shared layout wrapper ─────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1E293B;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:${CARD_BG};border-radius:16px;
                    border:1px solid ${BORDER};overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,${TEAL} 0%,${TEAL_DK} 100%);
                     padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.75);
                      text-transform:uppercase;font-weight:600;">Dr. Greeshma Connect</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFFFFF;
                       line-height:1.3;">${title}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BG};padding:20px 32px;border-top:1px solid ${BORDER};
                     text-align:center;">
            <p style="margin:0;font-size:12px;color:${SLATE};">
              Dr. Greeshma Gopinath &bull; Obstetrician &amp; Gynecologist
            </p>
            <p style="margin:4px 0 0;font-size:11px;color:#94A3B8;">
              This is an automated message from Dr. Greeshma Connect. Please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Shared detail row ─────────────────────────────────────────────────────────

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;font-weight:600;color:${SLATE};width:140px;
               border-bottom:1px solid ${BORDER};">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1E293B;border-bottom:1px solid ${BORDER};">
      ${value}
    </td>
  </tr>`;
}

function detailTable(rows: string[]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border:1px solid ${BORDER};border-radius:10px;overflow:hidden;margin:16px 0;">
    ${rows.join("")}
  </table>`;
}

function button(text: string, href: string, bg = TEAL): string {
  return `<a href="${href}" target="_blank"
    style="display:inline-block;background:${bg};color:#FFFFFF;font-size:14px;
           font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;
           margin:8px 0;">${text}</a>`;
}

// ── IST formatter ─────────────────────────────────────────────────────────────

function fmtIST(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday:  "long",
    year:     "numeric",
    month:    "long",
    day:      "numeric",
    hour:     "numeric",
    minute:   "2-digit",
    hour12:   true,
  });
}

function fmtTimeIST(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour:     "numeric",
    minute:   "2-digit",
    hour12:   true,
  });
}

function fmtINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ── Template types ────────────────────────────────────────────────────────────

export interface EmailAppt {
  id:           string;
  patientName:  string;
  patientEmail: string;
  startsAt:     Date;
  endsAt:       Date;
  service:      { title: string; durationMin: number; priceInr: number };
  doctor:       { user: { name: string } };
  meetLink:     string | null;
  cancellationReason?: string | null;
}

// ── BOOKING CONFIRMED ─────────────────────────────────────────────────────────

export function bookingConfirmedEmail(appt: EmailAppt): { subject: string; html: string } {
  const rows = [
    detailRow("Consultation",    appt.service.title),
    detailRow("Date &amp; Time", fmtIST(appt.startsAt)),
    detailRow("Duration",        `${appt.service.durationMin} minutes`),
    detailRow("Doctor",          appt.doctor.user.name),
    detailRow("Booking ID",      appt.id.slice(-12).toUpperCase()),
    detailRow("Fee",             fmtINR(appt.service.priceInr)),
  ];

  const meetSection = appt.meetLink
    ? `<p style="margin:20px 0 8px;font-size:14px;color:${SLATE};font-weight:600;">
         Join your consultation
       </p>
       <p style="margin:0 0 8px;font-size:13px;color:${SLATE};">
         Your Google Meet link is ready. Use it at your scheduled time.
       </p>
       ${button("Join Google Meet", appt.meetLink)}`
    : `<p style="margin:20px 0 8px;font-size:13px;color:${SLATE};">
         Your Google Meet link will be sent once the doctor confirms your appointment.
       </p>`;

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#1E293B;">
      Dear <strong>${appt.patientName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:${SLATE};">
      Your appointment has been <strong style="color:${TEAL};">confirmed</strong>.
      Here are the details:
    </p>
    ${detailTable(rows)}
    ${meetSection}
    <p style="margin:24px 0 0;font-size:13px;color:${SLATE};">
      Please ensure you have a stable internet connection and a quiet space for your
      consultation. If you need to reschedule or cancel, please do so at least
      <strong>2 hours</strong> in advance.
    </p>`;

  return {
    subject: `Appointment Confirmed — ${appt.service.title} on ${fmtIST(appt.startsAt)}`,
    html:    layout("Appointment Confirmed", body),
  };
}

// ── BOOKING RESCHEDULED ───────────────────────────────────────────────────────

export function bookingRescheduledEmail(appt: EmailAppt): { subject: string; html: string } {
  const rows = [
    detailRow("Consultation",       appt.service.title),
    detailRow("New Date &amp; Time", fmtIST(appt.startsAt)),
    detailRow("New End Time",       fmtTimeIST(appt.endsAt)),
    detailRow("Duration",           `${appt.service.durationMin} minutes`),
    detailRow("Doctor",             appt.doctor.user.name),
    detailRow("Booking ID",         appt.id.slice(-12).toUpperCase()),
  ];

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#1E293B;">
      Dear <strong>${appt.patientName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:${SLATE};">
      Your appointment has been <strong style="color:${AMBER};">rescheduled</strong>.
      Please note your new date and time:
    </p>
    ${detailTable(rows)}
    ${appt.meetLink
      ? `<p style="margin:20px 0 8px;font-size:13px;color:${SLATE};">Your Google Meet link remains the same:</p>
         ${button("Join Google Meet", appt.meetLink)}`
      : ""}
    <p style="margin:24px 0 0;font-size:13px;color:${SLATE};">
      If this rescheduled time does not work for you, please contact us to arrange an alternative.
    </p>`;

  return {
    subject: `Appointment Rescheduled — New time: ${fmtIST(appt.startsAt)}`,
    html:    layout("Appointment Rescheduled", body),
  };
}

// ── BOOKING CANCELLED ─────────────────────────────────────────────────────────

export function bookingCancelledEmail(appt: EmailAppt): { subject: string; html: string } {
  const rows = [
    detailRow("Consultation", appt.service.title),
    detailRow("Was scheduled", fmtIST(appt.startsAt)),
    detailRow("Booking ID",   appt.id.slice(-12).toUpperCase()),
    ...(appt.cancellationReason
      ? [detailRow("Reason", appt.cancellationReason)]
      : []),
  ];

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#1E293B;">
      Dear <strong>${appt.patientName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:${SLATE};">
      Your appointment has been <strong style="color:${RED};">cancelled</strong>.
    </p>
    ${detailTable(rows)}
    <p style="margin:24px 0 0;font-size:13px;color:${SLATE};">
      If you'd like to book a new appointment, please visit our website.
      We're sorry for any inconvenience caused.
    </p>`;

  return {
    subject: `Appointment Cancelled — ${appt.service.title}`,
    html:    layout("Appointment Cancelled", body),
  };
}

// ── REMINDER 24H ──────────────────────────────────────────────────────────────

export function reminder24hEmail(appt: EmailAppt): { subject: string; html: string } {
  const rows = [
    detailRow("Consultation",    appt.service.title),
    detailRow("Date &amp; Time", fmtIST(appt.startsAt)),
    detailRow("Duration",        `${appt.service.durationMin} minutes`),
    detailRow("Doctor",          appt.doctor.user.name),
  ];

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#1E293B;">
      Dear <strong>${appt.patientName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:${SLATE};">
      This is a friendly reminder that your appointment is
      <strong style="color:${TEAL};">tomorrow</strong>.
    </p>
    ${detailTable(rows)}
    ${appt.meetLink
      ? `<p style="margin:20px 0 8px;font-size:13px;color:${SLATE};font-weight:600;">
           Join your consultation
         </p>
         ${button("Join Google Meet", appt.meetLink)}`
      : ""}
    <p style="margin:24px 0 0;font-size:13px;color:${SLATE};">
      Please have a stable internet connection ready and join 2–3 minutes early.
      If you need to reschedule, please do so at least 2 hours before the appointment.
    </p>`;

  return {
    subject: `Reminder: Your appointment tomorrow at ${fmtTimeIST(appt.startsAt)} IST`,
    html:    layout("Appointment Reminder — Tomorrow", body),
  };
}

// ── REMINDER 1H ───────────────────────────────────────────────────────────────

export function reminder1hEmail(appt: EmailAppt): { subject: string; html: string } {
  const rows = [
    detailRow("Consultation",    appt.service.title),
    detailRow("Time",            fmtTimeIST(appt.startsAt) + " IST"),
    detailRow("Duration",        `${appt.service.durationMin} minutes`),
  ];

  const body = `
    <p style="margin:0 0 8px;font-size:15px;color:#1E293B;">
      Dear <strong>${appt.patientName}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:${SLATE};">
      Your appointment starts in <strong style="color:${TEAL};">about 1 hour</strong>.
      Please be ready!
    </p>
    ${detailTable(rows)}
    ${appt.meetLink
      ? `${button("Join Google Meet Now", appt.meetLink)}`
      : `<p style="font-size:13px;color:${SLATE};">
           Your Meet link will be available once the doctor confirms.
         </p>`}
    <p style="margin:24px 0 0;font-size:13px;color:${SLATE};">
      Find a quiet space with good lighting and a stable internet connection.
    </p>`;

  return {
    subject: `Your consultation starts in 1 hour — ${fmtTimeIST(appt.startsAt)} IST`,
    html:    layout("Appointment in 1 Hour", body),
  };
}
