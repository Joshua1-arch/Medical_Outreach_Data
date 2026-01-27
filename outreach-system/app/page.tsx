import Link from "next/link";
import Image from "next/image";
import { Heart, Activity, Brain, ArrowRight, MessageCircle, Mail, Phone, ChevronDown, LogIn, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-dark flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO ONLY - No wrapper, specific width/height to prevent cropping */}
            <Image
              src="/Reach.png"
              alt="ReachPoint Logo"
              width={50}
              height={50}
              className="object-contain" // Ensures the full logo is visible
              priority
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-dark transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
              <LogIn size={18} className="text-brand-gold" />
              Sign In
            </Link>
            <Link href="/signup" className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] group">
              <Sparkles size={16} className="text-brand-gold group-hover:animate-pulse" />
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pt-32 pb-20 px-6">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
            The Unified Platform for Field Data Collection & Clinical Research
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-serif mb-8 leading-tight text-brand-dark">
            Welcome to <br />
            <span className="text-brand-gold italic">ReachPoint</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Deploy custom data modules, manage multi-site projects, and visualize health analytics in real-time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-brand-dark text-white rounded-lg hover:shadow-xl hover:shadow-slate-200 transition-all font-bold text-lg flex items-center gap-2 shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] group">
              Launch Platform <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-brand-gold hover:text-brand-dark transition-all font-bold text-lg hover:shadow-md flex items-center gap-2">
              <LogIn size={18} className="text-slate-400" />
              Access Portal
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-brand-dark">
              <Brain size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-brand-dark">AI Chief Medical Officer</h3>
            <p className="text-slate-500 leading-relaxed">
              Instantly analyze aggregate patient data to identify trends, outbreaks, and intervention opportunities using advanced AI models.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-brand-dark">
              <Activity size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-brand-dark">Dynamic Analytics</h3>
            <p className="text-slate-500 leading-relaxed">
              Visualize health metrics with professional charts. Track patient volume, disease prevalence, and completion rates in real-time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-brand-dark">
              <Heart size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-brand-dark">Custom Form Builder</h3>
            <p className="text-slate-500 leading-relaxed">
              Design tailored data collection forms for any medical specialty. Drag-and-drop interface with validation and security built-in.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about ReachPoint.</p>
          </div>

          <div className="space-y-4">
            <details className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-brand-gold/30 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-gold transition-colors">Does it work offline?</h3>
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                Yes! ReachPoint is built as a Progressive Web App (PWA). You can collect data in remote areas with zero internet. The system automatically syncs your records to the secure cloud the moment you regain connectivity.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-brand-gold/30 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-gold transition-colors">Can I customize the medical forms?</h3>
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                Absolutely. Our Dynamic Form Builder allows you to create specific data modules for any project—whether it's a Malaria Survey, a Blood Drive, or a Thesis Questionnaire. You define the variables; we handle the data structure.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-brand-gold/30 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-gold transition-colors">Is my patient data secure?</h3>
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                Security is our foundation. All data is encrypted in transit and at rest. We use strict Role-Based Access Control (RBAC), ensuring that volunteers only see what they need to see, while sensitive admin data remains protected.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-brand-gold/30 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-gold transition-colors">How do I add my team members?</h3>
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                You can generate secure "Invitation Codes" from your Admin Dashboard. Send these to your data collectors or students. This allows them to sign up and join your project instantly without waiting for manual approval.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-brand-gold/30 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-gold transition-colors">Can I export data for analysis?</h3>
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                Yes. ReachPoint features a "Research-Ready" export engine. You can download your entire dataset as a clean CSV/Excel file, pre-formatted for immediate analysis in tools like SPSS, Python (Pandas), or R.
              </div>
            </details>

            <details className="group bg-white rounded-xl shadow-sm border border-slate-100 open:border-brand-gold/30 transition-all">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h3 className="font-bold text-slate-800 group-hover:text-brand-gold transition-colors">What devices are supported?</h3>
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                ReachPoint works on any device with a browser. It is optimized for mobile phones (Android/iOS) for field data collection, and offers a rich dashboard experience on laptops and tablets for project administration.
              </div>
            </details>
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mt-32 bg-brand-dark rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-gold rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Transform Your Outreach?</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Get in touch with our team to schedule a demo or discuss your specific needs.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a href="mailto:contact@medoutreach.com" className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl transition-all group">
                <div className="p-2 bg-brand-gold text-brand-dark rounded-lg group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Email Us</p>
                  <p className="font-medium">contact@reachpoint.com</p>
                </div>
              </a>

              <a href="tel:+1234567890" className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl transition-all group">
                <div className="p-2 bg-brand-gold text-brand-dark rounded-lg group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Call Us</p>
                  <p className="font-medium">+234 9126461386</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/+2349126461386"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all hover:bg-[#20bd5a] flex items-center justify-center"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={28} fill="white" className="text-white" />
        </a>

        {/* Footer */}
        <div className="mt-32 border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
          <p>&copy; 2026 ReachPoint. Designed for Excellence.</p>
        </div>
      </main>
    </div>
  );
}