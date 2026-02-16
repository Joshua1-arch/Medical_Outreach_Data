'use client';

import { Mail, Phone } from "lucide-react";
import { useSiteConfig } from "@/app/context/SiteConfigProvider";

export default function ContactSection() {
    const { whatsappNumber } = useSiteConfig();

    return (
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
                    <a href="mailto:contact@reachpoint.com" className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl transition-all group">
                        <div className="p-2 bg-brand-gold text-brand-dark rounded-lg group-hover:scale-110 transition-transform">
                            <Mail size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Email Us</p>
                            <p className="font-medium">contact@reachpoint.com</p>
                        </div>
                    </a>

                    <a href={`tel:${whatsappNumber}`} className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl transition-all group">
                        <div className="p-2 bg-brand-gold text-brand-dark rounded-lg group-hover:scale-110 transition-transform">
                            <Phone size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Call Us</p>
                            <p className="font-medium">{whatsappNumber || '+234 9126461386'}</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
