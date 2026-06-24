export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="font-display text-5xl font-bold tracking-tight">
        Dr. Greeshma Connect
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Smart Telehealth Booking Platform — coming in Step 3
      </p>
      <a
        href="/book"
        className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Book Appointment
      </a>
    </main>
  );
}
