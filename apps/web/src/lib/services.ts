import {
  HeartHandshake,
  Activity,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  Icon: LucideIcon;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  included: string[];
  whatToExpect: string[];
  duration: string;
  priceInr: number;
  faqs: ServiceFAQ[];
  gradient: string;
  iconColor: string;
  borderHover: string;
}

export const SERVICES: Service[] = [
  {
    slug: "pregnancy-consultation",
    Icon: HeartHandshake,
    title: "Pregnancy Consultation",
    tagline: "Expert antenatal care from first trimester to delivery",
    summary:
      "Comprehensive pregnancy care with personalised birth planning, risk assessment, and trimester-by-trimester guidance.",
    description:
      "Dr. Greeshma provides thorough, evidence-based pregnancy care tailored to each patient's unique history. Whether it's your first pregnancy or you have a complex obstetric history, every consultation includes a detailed review of your symptoms, blood results, and ultrasound reports — followed by a clear, written care plan. Telehealth makes expert OB-GYN guidance accessible from the comfort of your home.",
    included: [
      "First trimester dating & viability assessment",
      "Trimester-specific nutritional and lifestyle guidance",
      "Gestational diabetes & hypertension risk screening",
      "Anomaly scan review and interpretation",
      "Birth plan creation and discussion",
      "Report review (blood tests, growth scans, CTG)",
      "Prescription / referral letter if clinically required",
      "48-hour WhatsApp follow-up support",
    ],
    whatToExpect: [
      "Email your medical history and previous reports at least 30 minutes before the appointment.",
      "Join the Google Meet link (sent at the time of booking) from any device.",
      "Dr. Greeshma will review your reports and address all your concerns in detail.",
      "Receive a written care plan with next steps within 2 hours of the call.",
      "A WhatsApp summary of the consultation and prescription (if any) by end of day.",
    ],
    duration: "60 min",
    priceInr: 1200,
    faqs: [
      {
        question: "When should I book my first consultation?",
        answer:
          "As soon as you have a positive pregnancy test — ideally before 8 weeks. Early consultation allows Dr. Greeshma to establish your baseline health, identify risk factors, and plan your full antenatal schedule.",
      },
      {
        question: "What documents should I prepare?",
        answer:
          "Please keep your last menstrual period (LMP) date, previous ultrasound reports, blood test results, and a list of current medications ready. Email them to us at least 30 minutes before the appointment.",
      },
      {
        question: "Do you manage high-risk pregnancies?",
        answer:
          "Yes. Dr. Greeshma has extensive experience managing high-risk pregnancies including twin pregnancies, gestational diabetes, pre-eclampsia, placenta praevia, and recurrent miscarriages. She coordinates with your local hospital when in-person care is required.",
      },
      {
        question: "Is telehealth safe for pregnancy consultations?",
        answer:
          "Absolutely. Telehealth is ideal for consultations, report reviews, and follow-ups. Physical examinations are guided to your local clinic — Dr. Greeshma will advise on the correct schedule and what to monitor at home.",
      },
    ],
    gradient: "from-teal/15 to-teal/5",
    iconColor: "text-teal",
    borderHover: "hover:border-teal/40",
  },
  {
    slug: "pcos-pcod-consultation",
    Icon: Activity,
    title: "PCOS / PCOD Consultation",
    tagline: "Personalised management for hormonal balance and long-term health",
    summary:
      "Evidence-based PCOS management covering hormonal assessment, metabolic health, diet, and fertility implications.",
    description:
      "Polycystic Ovary Syndrome affects 1 in 5 women and yet often goes undiagnosed for years. Dr. Greeshma takes a holistic, evidence-based approach — combining thorough hormone profiling with tailored lifestyle and medical interventions. Whether your concern is irregular cycles, weight gain, acne, or fertility, every consultation results in a clear, personalised management plan.",
    included: [
      "Comprehensive symptom and hormone history review",
      "Interpretation of blood tests (LH, FSH, AMH, insulin, thyroid)",
      "Ultrasound report review for ovarian morphology",
      "Personalised diet, exercise, and lifestyle plan",
      "Medical management options (oral contraceptives, metformin, etc.)",
      "Fertility implications and planning if relevant",
      "Written management protocol with monitoring schedule",
      "48-hour WhatsApp follow-up support",
    ],
    whatToExpect: [
      "Complete the pre-consultation form (sent via email) covering your cycle history and current symptoms.",
      "Share recent blood test results and ultrasound reports at least 30 minutes before the call.",
      "Dr. Greeshma will explain your diagnosis, severity, and all available treatment options.",
      "Receive a written management plan covering diet, medication, and follow-up testing.",
      "Clear guidance on when to re-test hormones and track progress.",
    ],
    duration: "45 min",
    priceInr: 900,
    faqs: [
      {
        question: "How do I know if I have PCOS?",
        answer:
          "PCOS is diagnosed when at least two of three criteria are present: irregular periods, elevated androgen levels (or symptoms like acne/excess hair), and polycystic ovaries on ultrasound. Dr. Greeshma will review your results and confirm the diagnosis.",
      },
      {
        question: "Can PCOS be cured?",
        answer:
          "PCOS cannot be cured but it can be very effectively managed. Many women see significant improvement in symptoms with the right combination of lifestyle changes and medication. Early intervention also reduces the long-term risk of diabetes and cardiovascular disease.",
      },
      {
        question: "Will I have difficulty getting pregnant with PCOS?",
        answer:
          "Many women with PCOS conceive naturally or with minimal intervention. Dr. Greeshma will assess your fertility profile and guide you through appropriate options, from lifestyle optimisation to ovulation induction if needed.",
      },
      {
        question: "What tests should I get before the consultation?",
        answer:
          "Ideally: Day 2–3 hormone panel (LH, FSH, estradiol, AMH), thyroid function tests, fasting insulin and glucose, testosterone, and a pelvic ultrasound. Dr. Greeshma can advise on priorities if you have only some of these.",
      },
    ],
    gradient: "from-violet/15 to-violet/5",
    iconColor: "text-violet",
    borderHover: "hover:border-violet/40",
  },
  {
    slug: "infertility-consultation",
    Icon: Sparkles,
    title: "Infertility Consultation",
    tagline: "Compassionate, evidence-based guidance for your fertility journey",
    summary:
      "Thorough evaluation and compassionate guidance for couples navigating the path to parenthood.",
    description:
      "Infertility affects 1 in 6 couples, and the emotional weight is as significant as the medical complexity. Dr. Greeshma provides a warm, thorough, science-driven approach — reviewing all possible factors including ovarian reserve, uterine health, tubal patency, and partner semen analysis — and co-creating a clear roadmap. You will never feel rushed, unheard, or without a plan.",
    included: [
      "Complete fertility history review (both partners if applicable)",
      "Ovarian reserve assessment (AMH, AFC on ultrasound)",
      "Uterine and tubal factor evaluation guidance",
      "Semen analysis review and interpretation",
      "Ovulation tracking advice and cycle mapping",
      "IUI / IVF readiness assessment and referral if needed",
      "Written fertility roadmap with timelines",
      "Psychological support resources",
    ],
    whatToExpect: [
      "Fill in the detailed fertility history form (sent after booking) covering both partners.",
      "Share all previous fertility investigations, HSG reports, semen analysis, and hormone tests.",
      "Dr. Greeshma will explain all findings and discuss each treatment option honestly.",
      "Receive a written fertility roadmap with clear next steps and realistic timelines.",
      "Referral letters for IUI / IVF centres if appropriate, with personalised centre recommendations.",
    ],
    duration: "60 min",
    priceInr: 1500,
    faqs: [
      {
        question: "When should we seek an infertility consultation?",
        answer:
          "If you are under 35 and have been trying for 12 months without success, or over 35 and trying for 6 months, it's time to consult. With known conditions like PCOS or endometriosis, earlier evaluation is recommended.",
      },
      {
        question: "Does my partner need to join the call?",
        answer:
          "It is strongly encouraged for the first consultation, as male factor infertility accounts for nearly 40% of cases. Having both partners present allows a complete picture and saves significant time.",
      },
      {
        question: "Do you offer IVF treatments directly?",
        answer:
          "Dr. Greeshma provides evaluation, counselling, and referrals. If IVF is the right path, she will recommend the most suitable centre for your needs and help you understand the entire process.",
      },
      {
        question: "Is the consultation completely confidential?",
        answer:
          "Completely. All consultations are conducted over a private, encrypted Google Meet session. Your records are never shared without your explicit consent.",
      },
    ],
    gradient: "from-rose-gold/20 to-rose-gold/5",
    iconColor: "text-rose-gold",
    borderHover: "hover:border-rose-gold/40",
  },
  {
    slug: "post-delivery-care",
    Icon: ShieldCheck,
    title: "Post-Delivery Care",
    tagline: "Recovery, lactation support, and newborn guidance",
    summary:
      "Expert postnatal care covering maternal recovery, breastfeeding support, and newborn health milestones.",
    description:
      "The weeks after delivery are often the most overlooked — yet they are critical for both mother and baby. Dr. Greeshma's post-delivery consultations cover everything from wound healing and mental wellbeing to breastfeeding challenges and contraception planning, because motherhood should begin with confidence, not confusion.",
    included: [
      "Postnatal recovery assessment (C-section or normal delivery)",
      "Breastfeeding, latching, and milk supply guidance",
      "Lochia, episiotomy, and wound healing review",
      "Postpartum depression screening and support resources",
      "Newborn feeding, weight gain, and jaundice queries",
      "Contraception counselling after delivery",
      "Return to exercise and diet guidance",
      "48-hour WhatsApp follow-up",
    ],
    whatToExpect: [
      "Share your delivery summary (type, date, any complications) before the call.",
      "List current medications and any specific concerns you want addressed.",
      "Dr. Greeshma will assess your physical recovery and emotional wellbeing.",
      "Receive a postnatal care plan with weekly milestones and red-flag signs to watch for.",
      "Breastfeeding tips, supplement recommendations, and prescriptions if needed.",
    ],
    duration: "30 min",
    priceInr: 800,
    faqs: [
      {
        question: "When is the best time to book a post-delivery consultation?",
        answer:
          "Ideally between day 5–10 after delivery, and again at 6 weeks. Dr. Greeshma also sees patients earlier if there are concerns about breastfeeding, pain, or emotional distress — don't wait if you're struggling.",
      },
      {
        question: "Can I ask about my baby's health as well?",
        answer:
          "Yes, for general newborn queries related to feeding, jaundice, and weight gain. For specific paediatric concerns, Dr. Greeshma will guide you to a neonatologist or paediatrician.",
      },
      {
        question: "I'm struggling with breastfeeding. Can this consultation help?",
        answer:
          "Absolutely. Latching difficulties, low supply, engorgement, and nipple pain are among the most common reasons mothers book this consultation. Dr. Greeshma will guide you through positioning, feeding frequency, and supplementation if needed.",
      },
      {
        question: "What about postpartum mood changes?",
        answer:
          "Postpartum blues are common; postpartum depression affects 1 in 7 mothers and is very treatable. Dr. Greeshma screens for this in every post-delivery consultation and provides appropriate support and referrals.",
      },
    ],
    gradient: "from-teal/15 to-violet/10",
    iconColor: "text-teal",
    borderHover: "hover:border-teal/40",
  },
  {
    slug: "general-gynecology",
    Icon: Stethoscope,
    title: "General Gynecology Consultation",
    tagline: "Complete women's wellness — screenings, cycles, and preventive care",
    summary:
      "Annual check-ups, cervical screenings, contraception counselling, and menstrual health for women at every stage of life.",
    description:
      "From teenage years to menopause and beyond, Dr. Greeshma offers a safe, non-judgmental space for all gynaecological concerns. Whether it's a Pap smear review, contraception advice, irregular bleeding, pelvic pain, or a routine wellness check — every consultation is thorough, respectful, and tailored to your stage of life.",
    included: [
      "Complete gynaecological history and symptom review",
      "Pap smear / cervical screening result interpretation",
      "Contraception counselling (pills, IUD, implant, sterilisation)",
      "Menstrual irregularity, dysmenorrhoea, and PMS management",
      "Pelvic pain and endometriosis evaluation",
      "Vaginal health, infection, and STI counselling",
      "Menopause and HRT guidance",
      "Preventive health — breast self-exam, cancer screening timelines",
    ],
    whatToExpect: [
      "Share your last menstrual period date, cycle regularity, and main concern before the call.",
      "Email any recent Pap smear, ultrasound, or blood test results.",
      "Dr. Greeshma will review your history and address all concerns without judgement.",
      "Receive clear guidance, any required prescription, and a follow-up care plan.",
      "Referral for physical examination or additional investigations if recommended.",
    ],
    duration: "30 min",
    priceInr: 700,
    faqs: [
      {
        question: "How often should I have a gynaecological check-up?",
        answer:
          "Once a year for all sexually active women. A Pap smear is recommended every 3 years from age 21 (or as per local guidelines). Dr. Greeshma will advise on the right schedule based on your age, history, and risk factors.",
      },
      {
        question: "Can I discuss contraception options during this consultation?",
        answer:
          "Yes — this is one of the most common topics. Dr. Greeshma will review all methods (combined pill, mini-pill, IUD, implant, emergency contraception, permanent options) and help you make an informed, pressure-free choice.",
      },
      {
        question: "I have irregular or painful periods. Is this serious?",
        answer:
          "Irregular or painful periods can have many causes — PCOS, fibroids, endometriosis, thyroid issues, or stress. They are always worth investigating. Dr. Greeshma will help identify the cause and create a personalised treatment plan.",
      },
      {
        question: "Is it safe to discuss sensitive topics via telehealth?",
        answer:
          "Yes. The Google Meet session is completely private and encrypted. Dr. Greeshma creates a non-judgmental space for all concerns, including those related to sexual health, domestic situations, or mental wellbeing.",
      },
    ],
    gradient: "from-violet/15 to-rose-gold/10",
    iconColor: "text-violet",
    borderHover: "hover:border-violet/40",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
