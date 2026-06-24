import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ServicesPreview } from "@/components/sections/ServicesPreview";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTABand } from "@/components/sections/CTABand";

export const metadata: Metadata = {
  title: "Dr. Greeshma Connect | Smart Telehealth Booking",
  description:
    "Book a secure video consultation with Dr. Greeshma Gopinath, OB-GYN specialist. Expert care for pregnancy, PCOS, infertility, and gynaecology from the comfort of your home.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ServicesPreview />
      <WhyChoose />
      <Testimonials />
      <CTABand />
    </>
  );
}
