'use client';

import Link from "next/link";
import Image from "next/image";
import { LogIn, Sparkles } from "lucide-react";
import { useSiteConfig } from "@/app/context/SiteConfigProvider";

export default function Navbar() {
    const { logoUrl, primaryColor, secondaryColor, isActive, announcementBanner } = useSiteConfig();

    return (
        <>
            {announcementBanner && (
                <div 
                    className="fixed top-0 w-full z-[60] text-center py-2 px-4 shadow-sm text-sm font-bold"
                    style={{ backgroundColor: secondaryColor, color: primaryColor }}
                >
                    {announcementBanner}
                </div>
            )}
            <header 
                className={`fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${announcementBanner ? 'top-[36px]' : 'top-0'}`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src={logoUrl || "/Reach.png"}
                            alt="Logo"
                            width={50}
                            height={50}
                            className="object-contain" // Ensures the full logo is visible
                            priority
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-brand-dark transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                            <LogIn size={18} style={{ color: secondaryColor }} /> {/* Dynamic color */}
                            Sign In
                        </Link>
                        <Link href="/signup" 
                            style={{ backgroundColor: primaryColor }} // Dynamic bg
                            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-sm font-bold hover:bg-slate-800 hover:shadow-lg transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] group"
                        >
                            <Sparkles size={16} style={{ color: secondaryColor }} className="group-hover:animate-pulse" /> {/* Dynamic color */}
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}
