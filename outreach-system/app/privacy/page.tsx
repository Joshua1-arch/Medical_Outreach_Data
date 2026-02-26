import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MapPin, Mail, BriefcaseMedical } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900 pb-20">
            {/* Navigation Header */}
            <div className="max-w-5xl mx-auto px-6 pt-10 pb-12 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[#fbc037] flex items-center justify-center shrink-0">
                        <BriefcaseMedical size={16} className="text-white fill-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">ReachPoint</span>
                </div>
                <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider">
                    <ArrowLeft size={16} className="text-[#fbc037]" />
                    Back to Home
                </Link>
            </div>

            <div className="max-w-[900px] mx-auto px-6">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111827] mb-3">
                            Privacy Policy
                        </h1>
                        <p className="text-sm font-semibold text-slate-500">
                            Effective: January 1, 2024 | Last Updated: October 24, 2024
                        </p>
                    </div>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-600 transition-colors h-fit">
                        Legal Document
                    </div>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 mb-16">
                    
                    {/* 1. Introduction */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-baseline gap-3">
                            <span className="text-[#fbc037] text-3xl">1.</span> Introduction
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-[15px]">
                            Welcome to ReachPoint. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our platform. As a medical outreach platform, the security of your information is our highest priority.
                        </p>
                    </section>

                    {/* 2. The Data We Collect */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-baseline gap-3">
                            <span className="text-[#fbc037] text-3xl">2.</span> The Data We Collect
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-[15px] mb-6">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#fbc037] flex-shrink-0 mt-0.5 fill-[#fbc037]/20" />
                                <p className="text-slate-600 text-[15px]">
                                    <strong className="text-slate-800 font-bold">Identity Data</strong> includes first name, last name, and professional credentials.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#fbc037] flex-shrink-0 mt-0.5 fill-[#fbc037]/20" />
                                <p className="text-slate-600 text-[15px]">
                                    <strong className="text-slate-800 font-bold">Contact Data</strong> includes email address and telephone numbers.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="text-[#fbc037] flex-shrink-0 mt-0.5 fill-[#fbc037]/20" />
                                <p className="text-slate-600 text-[15px]">
                                    <strong className="text-slate-800 font-bold">Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version.
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* 3. How We Use Your Data */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-baseline gap-3">
                            <span className="text-[#fbc037] text-3xl">3.</span> How We Use Your Data
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-[15px] mb-6">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-2 text-[15px]">Service Delivery</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    To provide and maintain our medical outreach services and platform functionality.
                                </p>
                            </div>
                            <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-2 text-[15px]">Communication</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    To contact you regarding updates, security alerts, and administrative messages.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-baseline gap-3">
                            <span className="text-[#fbc037] text-3xl">4.</span> Data Security
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-[15px]">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>
                </div>

                {/* Footer Section */}
                <div className="border-t border-slate-200/[0.8] pt-10 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-dashed">
                    <div>
                        <h3 className="text-[17px] font-black text-slate-900 mb-5 tracking-tight">ReachPoint Medical Outreach</h3>
                        <div className="space-y-3.5">
                            <div className="flex items-center gap-3">
                                <MapPin size={15} className="text-[#fbc037] flex-shrink-0" />
                                <span className="text-xs font-semibold text-slate-600">Ogbomoso, Oyo State, Nigeria</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={15} className="text-[#fbc037] flex-shrink-0" />
                                <a href="mailto:privacy@reachpoint.online" className="text-xs font-semibold text-slate-600 hover:text-[#fbc037] transition-colors">
                                    privacy@reachpoint.online
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:text-right mt-4 md:mt-0 space-y-2">
                        <p className="text-xs font-semibold text-slate-500">
                            Developer/Admin Contact: <strong className="text-slate-900">Joshua</strong>
                        </p>
                        <p className="text-[11px] font-bold text-slate-400">
                            © 2024 ReachPoint. All rights reserved.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
