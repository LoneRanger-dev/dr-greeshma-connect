import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getServiceBySlug } from "@/lib/services";
import { BRAND } from "@/config/site";
import { ServiceDetail } from "@/components/sections/ServiceDetail";

import { ChevronRight } from "lucide-react";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | ${BRAND}`,
    description: service.summary,
    openGraph: {
      title: `${service.title} | ${BRAND}`,
      description: service.summary,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-5xl px-4 pt-28 pb-4 sm:px-6 lg:px-8"
      >
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground" role="list">
          <li>
            <Link href="/" className="hover:text-teal transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href="/services" className="hover:text-teal transition-colors">
              Services
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="font-medium text-foreground" aria-current="page">
            {service.title}
          </li>
        </ol>
      </nav>

      <ServiceDetail slug={slug} />
    </>
  );
}
