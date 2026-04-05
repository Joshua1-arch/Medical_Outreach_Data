'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export default function ScreenSizeWarning() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const checkScreenSize = () => {
            const hasSeenWarning = localStorage.getItem('reachpoint_screen_warning_seen') === 'true';
            const isSmallScreen = window.innerWidth < 1024;

            if (!hasSeenWarning && isSmallScreen) {
                setIsVisible(true);
            }
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('reachpoint_screen_warning_seen', 'true');
    };

    if (!isMounted) return null;
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 relative">
                <div className="p-8 text-center flex flex-col items-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Monitor size={48} strokeWidth={1.5} className="text-[#fbc037]" />
                        <span className="text-slate-300 font-light text-3xl">/</span>
                        <Smartphone size={32} strokeWidth={1.5} className="text-slate-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Optimize Your View</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        The Event Dashboard contains powerful configuration tools and live charts. For the best experience, we strongly recommend managing your events on a <strong>desktop monitor</strong> or a larger tablet screen.
                    </p>

                    <button 
                        onClick={handleClose}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
                    >
                        I understand, continue
                    </button>
                </div>
            </div>
        </div>
    );
}
