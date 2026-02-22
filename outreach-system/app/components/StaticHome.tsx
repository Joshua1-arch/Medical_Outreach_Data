import Link from "next/link";
import Image from "next/image";
import {
  Heart, Activity, Brain, ArrowRight, ChevronDown,
  CheckCircle, Globe, ShieldCheck, Database, LineChart,
  Check, Users, Clock, BarChart3, Mail, Phone,
  Facebook, Twitter, Linkedin,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

/**
 * Stats data
 */
const STATS = [
  { label: "Countries Reached", value: "50+" },
  { label: "Volunteers Managed", value: "10k+" },
  { label: "Patient Records", value: "1M+" },
  { label: "Uptime Reliability", value: "99.9%" },
];

/**
 * About cards
 */
const ABOUT_CARDS = [
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Connecting medical teams with communities in over 50 countries, ensuring no location is too remote for quality care.",
  },
  {
    icon: Heart,
    title: "Our Mission",
    desc: "To empower outreach programs with the data they need to save lives, reducing administrative burden so focus remains on care.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Security",
    desc: "HIPAA-compliant data management you can rely on. Your patient data is encrypted, backed up, and secure.",
  },
];

/**
 * Features
 */
const FEATURES = [
  {
    icon: Database,
    title: "Data Management",
    desc: "Secure, HIPAA-compliant patient and event data storage. Digitize your intake forms, track patient history, and maintain continuity of care across different outreach events.",
    bullets: [
      "Cloud-based centralized records",
      "Offline mode for remote areas",
      "Customizable patient forms",
    ],
    imageQuery: "medical-data",
    imageLeft: false,
  },
  {
    icon: LineChart,
    title: "Real-time Reporting",
    desc: "Instant analytics to measure impact and resource allocation. Generate reports for stakeholders with a single click and visualize your outreach success.",
    bullets: [
      "Impact visualization dashboards",
      "Resource inventory tracking",
      "Donor-ready PDF exports",
    ],
    imageQuery: "analytics-chart",
    imageLeft: true,
  },
];

/**
 * FAQ items – preserved exactly as before + the five new ones from the previous session
 */
const FAQ_ITEMS = [
  {
    q: "Does it work offline?",
    a: "Yes! ReachPoint is built as a Progressive Web App (PWA). You can collect data in remote areas with zero internet. The system automatically syncs your records to the secure cloud the moment you regain connectivity.",
  },
  {
    q: "Is my patient data secure?",
    a: "Security is our foundation. All data is encrypted in transit and at rest. We use strict Role-Based Access Control (RBAC), ensuring that volunteers only see what they need to see, while sensitive admin data remains protected.",
  },
  {
    q: "How do I add my team members?",
    a: "Once your Event has been approved, you can share your gated link to Team Members right from your Dashboard. This allows them to fill in data without waiting manually for approval.",
  },
  {
    q: "Can I export data for analysis?",
    a: "Yes. ReachPoint features a \u201cResearch-Ready\u201d export engine. You can download your entire dataset as a clean CSV/Excel file, pre-formatted for immediate analysis in tools like SPSS, Python (Pandas), or R.",
  },
  {
    q: "How do I know if my event has been approved or rejected?",
    a: "Your \u201cMy Projects\u201d page shows a live status badge on every event card \u2014 Pending Review (amber), Approved (green), or Rejected (red). When an admin approves or rejects your submission you are also notified automatically by email, so you never have to keep checking back manually.",
  },
  {
    q: "Can patients receive their results directly by email?",
    a: "Yes. After recording a participant\u2019s data, you can send them a professional results email directly from the platform with one click. The email is automatically formatted as a branded health report which includes a results table with reference ranges for common vitals and tests so patients have a clear, readable summary of their screening.",
  },
  {
    q: "Does ReachPoint support inventory tracking?",
    a: "Yes \u2014 inventory tracking is optional and built right into the Event Builder. You can add medical supplies (drugs, consumables, equipment) to your event, set opening stock quantities, and the system will automatically deduct usage each time a patient record is saved during the outreach.",
  },
  {
    q: "Can I use a template to build my form quickly?",
    a: "Absolutely. The Form Builder includes Quick Start Templates for common outreach scenarios such as General Screening, Blood Drive, Eye Clinic, and more. Selecting a template pre-fills your form with the most relevant fields, which you can then customize to suit your specific event.",
  },
  {
    q: "Can I control how fields are laid out on the form?",
    a: "Yes. Each form field in the builder has a Width setting \u2014 full width (spanning the entire row) or half width (two fields side-by-side in a single row). A live preview updates instantly so you can see exactly how the finished form will look before publishing.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark flex flex-col">
      {/* ── Navbar (untouched) ── */}
      <Navbar />

      <main className="flex-1">

        {/* ═══════════════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36 pt-36">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#fbc037]/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

              {/* Left – copy */}
              <div className="flex flex-col gap-6">

                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1] font-serif">
                  Empowering Medical Outreach with{" "}
                  <span className="text-[#fbc037] italic">Precision</span>
                </h1>

                <p className="text-lg text-slate-600 sm:text-xl leading-relaxed max-w-xl">
                  Streamline data, manage events, and coordinate volunteers with ReachPoint. The all-in-one platform designed for modern medical missions.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="h-12 px-8 rounded-lg bg-[#fbc037] text-slate-900 font-bold hover:bg-[#fbc037]/90 transition-all shadow-lg shadow-[#fbc037]/25 flex items-center justify-center gap-2 group"
                  >
                    Get Started
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="h-12 px-8 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-[#fbc037] transition-all flex items-center justify-center gap-2"
                  >
                    Access Portal
                  </Link>
                </div>
              </div>

              {/* Right – image */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  <div className="absolute -top-6 -right-6 h-64 w-64 rounded-full bg-[#fbc037]/20 blur-3xl" />
                  <div className="absolute -bottom-6 -left-6 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
                  <img
                    src="https://picsum.photos/seed/medical/800/600"
                    alt="Medical team"
                    className="relative rounded-2xl shadow-2xl ring-1 ring-slate-900/10 object-cover w-full h-auto aspect-[4/3]"
                  />
                  {/* Floating badge */}
                  <div
                    className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5"
                    style={{ animation: "bounce 3s infinite" }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Patient Data Synced</p>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            STATS BAND
        ════════════════════════════════════════════════════ */}
        <section className="bg-slate-50 py-14 border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            ABOUT SECTION
        ════════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32" id="about">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <p className="text-base font-semibold text-[#fbc037] uppercase tracking-widest mb-2">About Us</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-serif">
                Bridging the Gap in Healthcare
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                ReachPoint was founded by medical professionals who saw a need for better tools in the field. We are dedicated to providing secure, efficient, and user-friendly technology to organizations making a difference.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3" id="mission">
              {ABOUT_CARDS.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-[#fbc037]/50 hover:shadow-xl hover:-translate-y-1 duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbc037]/10 text-[#fbc037] group-hover:bg-[#fbc037] group-hover:text-slate-900 transition-colors">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FEATURES SECTION
        ════════════════════════════════════════════════════ */}
        <section className="bg-slate-50 py-24 sm:py-32 border-y border-slate-100" id="features">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <p className="text-base font-semibold text-[#fbc037] uppercase tracking-widest mb-2">Platform Features</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-serif">
                Everything you need to run your outreach
              </h2>
            </div>

            <div className="flex flex-col gap-24">
              {FEATURES.map(({ icon: Icon, title, desc, bullets, imageQuery, imageLeft }, i) => (
                <div
                  key={i}
                  className="grid gap-12 lg:grid-cols-2 lg:items-center"
                >
                  {/* Image */}
                  <div className={`${imageLeft ? "order-2 lg:order-1" : "order-2 lg:order-2"} relative overflow-hidden rounded-2xl shadow-xl border border-slate-200`}>
                    <img
                      src={`https://picsum.photos/seed/${imageQuery}/800/600`}
                      alt={title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>

                  {/* Copy */}
                  <div className={`${imageLeft ? "order-1 lg:order-2" : "order-1 lg:order-1"} flex flex-col gap-6`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbc037] text-slate-900 shadow-sm">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 font-serif">{title}</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">{desc}</p>
                    <ul className="space-y-3">
                      {bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-center gap-3 text-slate-600">
                          <Check size={18} className="text-[#fbc037] shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FAQ SECTION  (preserved exactly)
        ════════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500">Everything you need to know about ReachPoint.</p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map(({ q, a }, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-[#fbc037]/30 transition-all"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="font-bold text-slate-800 group-hover:text-[#fbc037] transition-colors pr-4">
                      {q}
                    </h3>
                    <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            CTA SECTION
        ════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-24 shadow-2xl sm:px-12 sm:py-32 md:px-16">
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src="https://picsum.photos/seed/outreach-cta/1200/800"
                  alt=""
                  className="h-full w-full object-cover opacity-20"
                />
              </div>
              {/* Glow accents */}
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#fbc037]/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center gap-6">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
                  Ready to transform your outreach?
                </h2>
                <p className="max-w-xl text-lg text-slate-300">
                  Join thousands of medical professionals using ReachPoint to make a bigger impact. Get started for free today.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                  <Link
                    href="/signup"
                    className="h-12 px-8 rounded-lg bg-[#fbc037] text-slate-900 font-bold hover:bg-[#fbc037]/90 transition-all shadow-lg shadow-[#fbc037]/25 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    Get Started Now
                  </Link>
                  <a
                    href="#contact"
                    className="text-sm font-semibold text-white hover:text-[#fbc037] transition-colors flex items-center gap-1"
                  >
                    Contact Sales <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            CONTACT SECTION  (existing component — untouched)
        ════════════════════════════════════════════════════ */}
        <div id="contact" className="px-4 sm:px-6 lg:px-8 pb-16">
          <ContactSection />
        </div>

        {/* ── WhatsApp ── */}
        <WhatsAppFloatingButton />

        {/* ═══════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════ */}
        <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Image src="/Reach.png" alt="ReachPoint Logo" width={40} height={40} className="object-contain" />
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">ReachPoint</span>
                </div>
                <p className="text-sm leading-6 text-slate-600 max-w-sm">
                  Empowering medical missions with technology. We help you focus on what matters most: saving lives.
                </p>
                <div className="mt-6 flex gap-4">
                  <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-[#fbc037] transition-colors">
                    <Facebook size={22} />
                  </a>
                  <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-[#fbc037] transition-colors">
                    <Twitter size={22} />
                  </a>
                  <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-[#fbc037] transition-colors">
                    <Linkedin size={22} />
                  </a>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-6">Resources</h3>
                <ul className="space-y-4">
                  {["Documentation", "Guides", "API Status", "Case Studies"].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-600 hover:text-[#fbc037] transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-3">Newsletter</h3>
                <p className="text-sm text-slate-600 mb-6">
                  The latest news, articles, and resources — sent to your inbox weekly.
                </p>
                <form className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fbc037]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-[#fbc037] px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-[#fbc037]/90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-16 border-t border-slate-200 pt-8">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} ReachPoint, Inc. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}