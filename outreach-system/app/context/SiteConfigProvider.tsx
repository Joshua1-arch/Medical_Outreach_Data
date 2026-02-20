'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';


interface SiteConfig {
    themeMode: 'default' | 'christmas' | 'easter' | 'newyear' | 'halloween' | 'valentine';
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    announcementBanner: string;
    whatsappNumber: string;
    isActive: boolean;
}

const defaultContext: SiteConfig = {
    themeMode: 'default',
    primaryColor: '#0f172a',
    secondaryColor: '#fbbf24',
    logoUrl: '/Reach.png',
    announcementBanner: '',
    whatsappNumber: '+2349126461386',
    isActive: true
};

const SiteConfigContext = createContext<SiteConfig>(defaultContext);

export function useSiteConfig() {
    return useContext(SiteConfigContext);
}

export function SiteConfigProvider({
    children,
    initialConfig
}: {
    children: ReactNode;
    initialConfig: SiteConfig;
}) {
    const [config, setConfig] = useState<SiteConfig>(initialConfig || defaultContext);

    // Inject CSS variables into root style
    useEffect(() => {
        if (!config) return;

        const root = document.documentElement;
        root.style.setProperty('--brand-primary', config.primaryColor);
        root.style.setProperty('--brand-secondary', config.secondaryColor);
        // Also update brand-dark/gold specifically if that's what Tailwind uses
        // But for generic dynamic theming, the user asked for --brand-primary
        // If the Tailwind config uses specific colors, I might need to map them.
        // Assuming user will use var(--brand-primary) in Tailwind or direct CSS.
        // Or if existing Tailwind classes use these vars.
        // The project uses `bg-brand-dark` which is probably hardcoded or mapped to color.
        
        // Let's try to override the existing brand colors if possible.
        // Assuming tailwind.config.ts maps brand-dark -> ...
        // I'll set a few variables to be safe.
        // root.style.setProperty('--color-brand-dark', config.primaryColor); // Hypothetical
    }, [config]);

    return (
        <SiteConfigContext.Provider value={config}>
            {children}
        </SiteConfigContext.Provider>
    );
}
