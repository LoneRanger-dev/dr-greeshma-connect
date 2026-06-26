import Link from "next/link";
import { Stethoscope, Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { SITE, BRAND } from "@/config/site";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: `About ${SITE.shortName}` },
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book Appointment" },
  { href: "/styleguide", label: "Styleguide" },
];

const SERVICES_LINKS = [
  { href: "/services/pregnancy-consultation", label: "Pregnancy Consultation" },
  { href: "/services/pcos-pcod-consultation", label: "PCOS / PCOD" },
  { href: "/services/infertility-consultation", label: "Infertility" },
  { href: "/services/post-delivery-care", label: "Post-Delivery Care" },
  { href: "/services/general-gynecology", label: "General Gynecology" },
];

const HOURS = [
  { day: "Monday – Friday", time: "9:00 AM – 6:00 PM" },
  { day: "Saturday", time: "9:00 AM – 2:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-lg w-fit">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-violet shadow-[0_0_14px_oklch(0.636_0.131_185.7_/_0.3)]">
                <Stethoscope className="h-5 w-5 text-white" aria-hidden />
              </span>
              <span className="font-display text-lg font-bold">
                Dr.{" "}
                <span className="bg-gradient-to-r from-teal to-violet bg-clip-text text-transparent">
                  {SITE.doctorFirstName}
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium telehealth OB-GYN consultations with {SITE.doctorName}.
              Compassionate care, anywhere in India.
            </p>
            <div className="flex gap-3" aria-label="Social media links">
              {[
                { href: "#", icon: Instagram, label: "Instagram" },
                { href: "#", icon: Facebook, label: "Facebook" },
                { href: "#", icon: MessageCircle, label: "WhatsApp" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5" role="list">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-teal focus-visible:outline-none focus-visible:text-teal"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Services">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">
              Services
            </h3>
            <ul className="space-y-2.5" role="list">
              {SERVICES_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-teal focus-visible:outline-none focus-visible:text-teal"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + Hours */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">
                Contact
              </h3>
              <ul className="space-y-2.5" role="list">
                <li>
                  <a href="tel:+910000000000" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal">
                    <Phone className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                    +91 00000 00000
                  </a>
                </li>
                <li>
                  <a href="mailto:dr.greeshma@example.com" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal">
                    <Mail className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                    dr.greeshma@example.com
                  </a>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                  Hyderabad, Telangana, India
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-foreground">
                Clinic Hours
              </h3>
              <ul className="space-y-1.5" role="list">
                {HOURS.map(({ day, time }) => (
                  <li key={day} className="flex justify-between text-xs text-muted-foreground">
                    <span>{day}</span>
                    <span className="font-medium text-foreground/70">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Designed & built with ♥ in India · All consultations via Google Meet
          </p>
        </div>
      </div>
    </footer>
  );
}
