import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Dr. Greeshma Connect | Smart Telehealth Booking",
    template: "%s | Dr. Greeshma Connect",
  },
  description:
    "Book appointments with Dr. Greeshma Gopinath, Obstetrician & Gynecologist. Premium telehealth consultations for pregnancy, PCOS, infertility, and women's health.",
  keywords: [
    "OB-GYN",
    "telehealth",
    "appointment booking",
    "Dr. Greeshma Gopinath",
    "pregnancy consultation",
    "PCOS",
    "infertility",
    "gynecology",
  ],
  authors: [{ name: "Dr. Greeshma Gopinath" }],
  creator: "Dr. Greeshma Connect",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Dr. Greeshma Connect | Smart Telehealth Booking",
    description:
      "Premium telehealth consultations with Dr. Greeshma Gopinath, OB-GYN.",
    siteName: "Dr. Greeshma Connect",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>

        <Providers>
          <div id="main-content" role="main">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
