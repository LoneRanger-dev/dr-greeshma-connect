import type { Metadata } from "next";
import { SITE, BRAND } from "@/config/site";
import { MagicButton } from "@/components/ui/magic-button";
import { GlassCard } from "@/components/ui/glass-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Styleguide" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-border pb-2 text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-16 w-16 rounded-xl shadow-sm ${color}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-16">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-bold text-teal">
          {BRAND} — Design System
        </h1>
        <p className="text-muted-foreground">
          "Calm magical clinic" — teal · violet · rose-gold. Visual QA for Step 2.
        </p>
      </header>

      {/* ── Palette ── */}
      <Section title="Colour Palette">
        <div className="flex flex-wrap gap-6">
          <Swatch color="bg-teal" label="Teal (primary)" />
          <Swatch color="bg-teal-light" label="Teal light" />
          <Swatch color="bg-teal-dark" label="Teal dark" />
          <Swatch color="bg-violet" label="Violet" />
          <Swatch color="bg-violet-light" label="Violet light" />
          <Swatch color="bg-violet-dark" label="Violet dark" />
          <Swatch color="bg-rose-gold" label="Rose-gold (accent)" />
          <Swatch color="bg-rose-gold-light" label="Rose-gold light" />
          <Swatch color="bg-success" label="Success" />
          <Swatch color="bg-warning" label="Warning" />
          <Swatch color="bg-destructive" label="Destructive" />
          <Swatch color="bg-muted" label="Muted" />
          <Swatch color="bg-border" label="Border" />
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <div className="space-y-3">
          <h1 className="font-display text-5xl font-bold">Display / H1 — Sora</h1>
          <h2 className="font-display text-3xl font-semibold">H2 — Sora semibold</h2>
          <h3 className="font-display text-2xl font-medium">H3 — Sora medium</h3>
          <p className="text-lg">Body large — Inter 18px. Telehealth booking platform for {SITE.shortName}.</p>
          <p className="text-base">Body — Inter 16px. Comfortable reading for medical content.</p>
          <p className="text-sm text-muted-foreground">Small muted — labels, captions, metadata.</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Overline — uppercase xs</p>
        </div>
      </Section>

      {/* ── MagicButton ── */}
      <Section title="MagicButton (custom)">
        <div className="flex flex-wrap items-center gap-4">
          <MagicButton>Book Appointment</MagicButton>
          <MagicButton size="sm">Small</MagicButton>
          <MagicButton size="lg">Large CTA</MagicButton>
          <MagicButton variant="outline">Outline</MagicButton>
          <MagicButton variant="ghost">Ghost</MagicButton>
          <MagicButton isLoading>Loading…</MagicButton>
          <MagicButton disabled>Disabled</MagicButton>
        </div>
        <p className="text-sm text-muted-foreground">
          Hover → sheen sweep. Click → ripple. Keyboard focusable. Tap → press-scale.
        </p>
      </Section>

      {/* ── ShadCN Button ── */}
      <Section title="Button (ShadCN)">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      {/* ── Badges ── */}
      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-teal text-white">Confirmed</Badge>
          <Badge className="bg-violet text-white">Pending</Badge>
          <Badge className="bg-rose-gold text-foreground">New</Badge>
          <Badge className="bg-success text-white">Completed</Badge>
          <Badge className="bg-warning text-warning-foreground">Rescheduled</Badge>
        </div>
      </Section>

      {/* ── Inputs ── */}
      <Section title="Input">
        <div className="grid max-w-sm gap-3">
          <Input placeholder="Patient name" />
          <Input placeholder="Email address" type="email" />
          <Input placeholder="Phone number" type="tel" />
          <Input placeholder="Disabled" disabled />
        </div>
      </Section>

      {/* ── Card ── */}
      <Section title="Card (ShadCN)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment</CardTitle>
              <CardDescription>PCOS Consultation · 30 min</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {SITE.shortName} will review your reports and guide your treatment plan.
              </p>
            </CardContent>
          </Card>
          <Card className="border-teal/30 shadow-[0_0_20px_oklch(0.636_0.131_185.7_/_0.15)]">
            <CardHeader>
              <CardTitle className="text-teal">Pregnancy Consultation</CardTitle>
              <CardDescription>60 min · ₹1,200</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive antenatal check with a personalised care plan.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── GlassCard ── */}
      <Section title="GlassCard (custom)">
        <AuroraBackground className="rounded-2xl p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard className="p-5">
              <p className="font-display font-semibold text-foreground">Basic glass</p>
              <p className="mt-1 text-sm text-muted-foreground">Semi-transparent + blur</p>
            </GlassCard>
            <GlassCard hover className="p-5">
              <p className="font-display font-semibold text-foreground">Hover lift</p>
              <p className="mt-1 text-sm text-muted-foreground">Hover me to see lift effect</p>
            </GlassCard>
            <GlassCard glow hover className="p-5">
              <p className="font-display font-semibold text-teal">Glow + hover</p>
              <p className="mt-1 text-sm text-muted-foreground">Teal glow shadow</p>
            </GlassCard>
          </div>
        </AuroraBackground>
      </Section>

      {/* ── AuroraBackground ── */}
      <Section title="AuroraBackground">
        <AuroraBackground className="min-h-40 rounded-2xl p-8">
          <div className="text-center">
            <p className="font-display text-2xl font-bold">Aurora Light</p>
            <p className="text-muted-foreground">Teal → Violet → Rose-gold blobs</p>
          </div>
        </AuroraBackground>
        <AuroraBackground dark className="min-h-40 rounded-2xl bg-slate-900 p-8">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-white">Aurora Dark</p>
            <p className="text-white/60">Dark mode / hero section variant</p>
          </div>
        </AuroraBackground>
      </Section>

      {/* ── Skeleton ── */}
      <Section title="Skeleton">
        <div className="space-y-3 max-w-sm">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Shadows ── */}
      <Section title="Shadows & Glow">
        <div className="flex flex-wrap gap-6">
          <div className="h-20 w-32 rounded-xl bg-white shadow-[0_0_20px_oklch(0.636_0.131_185.7_/_0.35)] flex items-center justify-center text-xs text-teal font-medium">
            Glow
          </div>
          <div className="h-20 w-32 rounded-xl bg-white shadow-[0_0_30px_oklch(0.636_0.131_185.7_/_0.5),0_0_60px_oklch(0.636_0.131_185.7_/_0.2)] flex items-center justify-center text-xs text-teal font-medium">
            Glow LG
          </div>
          <div className="h-20 w-32 rounded-xl bg-white shadow-[0_0_20px_oklch(0.583_0.194_271.3_/_0.35)] flex items-center justify-center text-xs text-violet font-medium">
            Violet Glow
          </div>
          <div className="h-20 w-32 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_oklch(0_0_0_/_0.12)] flex items-center justify-center text-xs font-medium">
            Glass
          </div>
        </div>
      </Section>

      {/* ── Motion easing reference ── */}
      <Section title="Motion Easing Tokens">
        <div className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-sm space-y-1">
          <p><span className="text-teal">--ease-spring</span>: cubic-bezier(0.34, 1.56, 0.64, 1)</p>
          <p><span className="text-teal">--ease-smooth</span>: cubic-bezier(0.4, 0, 0.2, 1)</p>
          <p><span className="text-teal">--ease-bounce</span>: cubic-bezier(0.68, -0.55, 0.265, 1.55)</p>
          <p><span className="text-teal">--ease-out-expo</span>: cubic-bezier(0.19, 1, 0.22, 1)</p>
        </div>
      </Section>
    </div>
  );
}
