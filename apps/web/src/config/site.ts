export const SITE = {
  doctorName:   "Dr. Aria Menon",           // demo dummy name — change per client
  doctorFirstName: "Aria",
  shortName:    "Dr. Aria",                  // navbar logo text
  specialty:    "Obstetrician & Gynaecologist",
  tagline:      "Your Women's Health, Reimagined",
  heroSubtitle: "Book a secure video consultation with Dr. Aria Menon, specialist in pregnancy, PCOS, infertility, and gynaecology. Premium care from the comfort of your home.",
  hours:        "Mon – Sat · 9 AM – 6 PM IST · Instant confirmation",
  email:        "hello@demo-clinic.com",
  phone:        "+91 00000 00000",
} as const;

// Derived — constructed from the fields above so callers never hardcode the brand name
export const BRAND = `${SITE.doctorName} Connect` as const;
