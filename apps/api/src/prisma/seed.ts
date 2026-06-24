import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ──────────────────────────────────────────
// Services data (mirrors lib/services.ts)
// ──────────────────────────────────────────
const SERVICES = [
  {
    slug: "pregnancy-consultation",
    title: "Pregnancy Consultation",
    description:
      "Comprehensive pregnancy care with personalised birth planning, risk assessment, and trimester-by-trimester guidance.",
    durationMin: 60,
    priceInr: 1200,
  },
  {
    slug: "pcos-pcod-consultation",
    title: "PCOS / PCOD Consultation",
    description:
      "Evidence-based PCOS management covering hormonal assessment, metabolic health, diet, and fertility implications.",
    durationMin: 45,
    priceInr: 900,
  },
  {
    slug: "infertility-consultation",
    title: "Infertility Consultation",
    description:
      "Thorough evaluation and compassionate guidance for couples navigating the path to parenthood.",
    durationMin: 60,
    priceInr: 1500,
  },
  {
    slug: "post-delivery-care",
    title: "Post-Delivery Care",
    description:
      "Expert postnatal care covering maternal recovery, breastfeeding support, and newborn health milestones.",
    durationMin: 30,
    priceInr: 800,
  },
  {
    slug: "general-gynecology",
    title: "General Gynecology Consultation",
    description:
      "Annual check-ups, cervical screenings, contraception counselling, and menstrual health for women at every stage of life.",
    durationMin: 30,
    priceInr: 700,
  },
];

// Monday–Friday: 9 AM – 6 PM (weekday 1–5)
// Saturday: 9 AM – 2 PM (weekday 6)
const AVAILABILITY_RULES = [
  ...([1, 2, 3, 4, 5] as const).map((weekday) => ({
    weekday,
    startTime: "09:00",
    endTime: "18:00",
    slotIntervalMin: 30,
    isRecurring: true,
    validFrom: new Date("2025-01-01T00:00:00.000Z"),
    validTo: null,
  })),
  {
    weekday: 6,
    startTime: "09:00",
    endTime: "14:00",
    slotIntervalMin: 30,
    isRecurring: true,
    validFrom: new Date("2025-01-01T00:00:00.000Z"),
    validTo: null,
  },
];

async function main() {
  console.log("🌱 Seeding database…");

  // ── Doctor user ──
  const passwordHash = await bcrypt.hash("GreeshmaConnect@2025!", 12);

  const doctor = await prisma.user.upsert({
    where: { email: "dr.greeshma@drgreeshmaconnect.com" },
    update: {},
    create: {
      name: "Dr. Greeshma Gopinath",
      email: "dr.greeshma@drgreeshmaconnect.com",
      phone: "+910000000000",
      passwordHash,
      role: "DOCTOR",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Doctor user: ${doctor.email}`);

  // ── Doctor profile ──
  const doctorProfile = await prisma.doctorProfile.upsert({
    where: { userId: doctor.id },
    update: {},
    create: {
      userId: doctor.id,
      bio: "Dr. Greeshma Gopinath is a board-certified Obstetrician & Gynecologist with 15+ years of experience in high-risk pregnancies, PCOS, infertility, and minimally invasive gynaecological surgery.",
      specialties: [
        "High-Risk Pregnancies",
        "PCOS / PCOD Management",
        "Infertility & IVF Counselling",
        "Laparoscopic Surgery",
        "Normal & C-Section Deliveries",
        "Postnatal & Lactation Care",
        "Cervical Screening",
        "Menstrual Disorders",
      ],
      consultFeeDefault: 1000,
    },
  });

  console.log(`✅ Doctor profile created (id: ${doctorProfile.id})`);

  // ── Services ──
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        description: service.description,
        durationMin: service.durationMin,
        priceInr: service.priceInr,
        isActive: true,
      },
      create: service,
    });
  }

  console.log(`✅ Seeded ${SERVICES.length} services`);

  // ── Availability rules ──
  // Delete existing rules for this doctor before re-seeding (idempotent)
  await prisma.availabilityRule.deleteMany({
    where: { doctorId: doctorProfile.id },
  });

  await prisma.availabilityRule.createMany({
    data: AVAILABILITY_RULES.map((rule) => ({
      ...rule,
      doctorId: doctorProfile.id,
    })),
  });

  console.log(`✅ Seeded ${AVAILABILITY_RULES.length} availability rules`);

  // ── Admin user (optional) ──
  const admin = await prisma.user.upsert({
    where: { email: "admin@drgreeshmaconnect.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@drgreeshmaconnect.com",
      passwordHash: await bcrypt.hash("Admin@DrGreeshma2025!", 12),
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin user: ${admin.email}`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
