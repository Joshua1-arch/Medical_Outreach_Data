'use client';

import { MessageCircle } from "lucide-react";
import { useSiteConfig } from "@/app/context/SiteConfigProvider";

export default function WhatsAppFloatingButton() {
    const { whatsappNumber } = useSiteConfig();
    
    const cleanNumber = whatsappNumber ? whatsappNumber.replace(/[^\d]/g, '') : '2349126461386';

    return (
        <a
            href={`https://wa.me/${cleanNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all hover:bg-[#20bd5a] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={28} fill="white" className="text-white" />
        </a>
    );
}
