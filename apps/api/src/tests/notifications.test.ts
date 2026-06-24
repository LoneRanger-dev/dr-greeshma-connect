import { describe, it, expect } from "vitest";
import {
  bookingConfirmedEmail,
  bookingRescheduledEmail,
  bookingCancelledEmail,
  reminder24hEmail,
  reminder1hEmail,
  type EmailAppt,
} from "../modules/notifications/email-templates";

const SAMPLE_APPT: EmailAppt = {
  id:           "cm_sample_appointment_id",
  patientName:  "Priya Sharma",
  patientEmail: "priya@example.com",
  startsAt:     new Date("2026-07-01T07:00:00.000Z"), // 12:30 IST
  endsAt:       new Date("2026-07-01T08:00:00.000Z"), // 13:30 IST
  meetLink:     "https://meet.google.com/abc-defg-hij",
  cancellationReason: null,
  service: { title: "PCOS Consultation", durationMin: 60, priceInr: 1500 },
  doctor:  { user: { name: "Dr. Greeshma Gopinath" } },
};

describe("Email templates", () => {
  it("bookingConfirmedEmail generates valid HTML with patient name + service", () => {
    const { subject, html } = bookingConfirmedEmail(SAMPLE_APPT);
    expect(subject).toContain("Confirmed");
    expect(html).toContain("Priya Sharma");
    expect(html).toContain("PCOS Consultation");
    expect(html).toContain("Dr. Greeshma Gopinath");
    expect(html).toContain("meet.google.com");
    expect(html).toContain("₹1,500");
    expect(html).toMatch(/<html/i);
  });

  it("bookingConfirmedEmail without Meet link omits the join button", () => {
    const { html } = bookingConfirmedEmail({ ...SAMPLE_APPT, meetLink: null });
    expect(html).not.toContain("meet.google.com");
    expect(html).toContain("will be sent once the doctor confirms");
  });

  it("bookingRescheduledEmail generates valid HTML", () => {
    const { subject, html } = bookingRescheduledEmail(SAMPLE_APPT);
    expect(subject).toContain("Rescheduled");
    expect(html).toContain("Priya Sharma");
    expect(html).toContain("PCOS Consultation");
    expect(html).toMatch(/<html/i);
  });

  it("bookingCancelledEmail includes cancellation reason when provided", () => {
    const { subject, html } = bookingCancelledEmail({
      ...SAMPLE_APPT,
      cancellationReason: "Doctor unavailable",
    });
    expect(subject).toContain("Cancelled");
    expect(html).toContain("Doctor unavailable");
    expect(html).toContain("Cancelled");
  });

  it("bookingCancelledEmail works without cancellation reason", () => {
    const { html } = bookingCancelledEmail({ ...SAMPLE_APPT, cancellationReason: null });
    expect(html).toContain("Priya Sharma");
  });

  it("reminder24hEmail shows tomorrow messaging", () => {
    const { subject, html } = reminder24hEmail(SAMPLE_APPT);
    expect(subject).toContain("tomorrow");
    expect(html).toContain("tomorrow");
    expect(html).toContain("meet.google.com");
  });

  it("reminder1hEmail shows 1-hour messaging", () => {
    const { subject, html } = reminder1hEmail(SAMPLE_APPT);
    expect(subject).toContain("1 hour");
    expect(html).toContain("1 hour");
  });

  it("all templates include valid HTML boilerplate", () => {
    const templates = [
      bookingConfirmedEmail(SAMPLE_APPT),
      bookingRescheduledEmail(SAMPLE_APPT),
      bookingCancelledEmail(SAMPLE_APPT),
      reminder24hEmail(SAMPLE_APPT),
      reminder1hEmail(SAMPLE_APPT),
    ];
    for (const { html } of templates) {
      expect(html).toMatch(/<!DOCTYPE html>/i);
      expect(html).toContain("Dr. Greeshma Connect");
      expect(html).toContain("</html>");
    }
  });

  it("booking ID is last 12 chars uppercased", () => {
    const { html } = bookingConfirmedEmail(SAMPLE_APPT);
    expect(html).toContain("INTMENT_ID");
  });
});
