'use client';

import { useEffect, useState } from 'react';
import { useSiteConfig } from '@/app/context/SiteConfigProvider';
import { Snowflake, Egg, Ghost, Heart } from 'lucide-react';

export default function HolidayOverlay() {
    const config = useSiteConfig();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !config || !config.isActive || config.themeMode === 'default') return null;

    if (config.themeMode === 'christmas') {
        return <ChristmasSnow />;
    }

    if (config.themeMode === 'easter') {
        return <EasterDecorations />;
    }

    if (config.themeMode === 'halloween') {
        return <HalloweenGhosts />;
    }

    if (config.themeMode === 'valentine') {
        return <ValentineHearts />;
    }

    return null;
}

function ChristmasSnow() {
    // Generate random snowflakes
    const snowflakes = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.5,
        size: 10 + Math.random() * 20
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-0 text-white/80 animate-fall"
                    style={{
                        left: `${flake.left}%`,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `${flake.delay}s`,
                        opacity: flake.opacity,
                        fontSize: `${flake.size}px` // Using font size for icon
                    }}
                >
                    <Snowflake size={flake.size} />
                </div>
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(360deg); }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}

function EasterDecorations() {
    // Generate floating eggs
    const eggs = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 10,
        delay: Math.random() * 10,
        opacity: 0.2 + Math.random() * 0.3,
        size: 15 + Math.random() * 15,
        color: ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#D8B4FE'][Math.floor(Math.random() * 5)]
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
             {eggs.map((egg) => (
                <div
                    key={egg.id}
                    className="absolute -bottom-10 animate-float-up"
                    style={{
                        left: `${egg.left}%`,
                        animationDuration: `${egg.animationDuration}s`,
                        animationDelay: `${egg.delay}s`,
                        opacity: egg.opacity,
                        color: egg.color
                    }}
                >
                    <Egg size={egg.size} fill="currentColor" />
                </div>
            ))}
            <style jsx>{`
                @keyframes float-up {
                    0% { transform: translateY(10vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}

function HalloweenGhosts() {
    // Generate floating ghosts
    const ghosts = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 8 + Math.random() * 12,
        delay: Math.random() * 5,
        opacity: 0.1 + Math.random() * 0.3,
        size: 20 + Math.random() * 30
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
            {ghosts.map((ghost) => (
                <div
                    key={ghost.id}
                    className="absolute -bottom-20 animate-float-ghost text-slate-300"
                    style={{
                        left: `${ghost.left}%`,
                        animationDuration: `${ghost.animationDuration}s`,
                        animationDelay: `${ghost.delay}s`,
                        opacity: ghost.opacity,
                    }}
                >
                    <Ghost size={ghost.size} />
                </div>
            ))}
             <style jsx>{`
                @keyframes float-ghost {
                    0% { transform: translateY(10vh) translateX(0) rotate(0deg); opacity: 0; }
                    25% { transform: translateY(-20vh) translateX(20px) rotate(5deg); opacity: 0.5; }
                    50% { transform: translateY(-50vh) translateX(-20px) rotate(-5deg); opacity: 0.8; }
                    75% { transform: translateY(-80vh) translateX(10px) rotate(5deg); opacity: 0.5; }
                    100% { transform: translateY(-110vh) translateX(0) rotate(0deg); opacity: 0; }
                }
                .animate-float-ghost {
                    animation-name: float-ghost;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}

function ValentineHearts() {
    // Generate floating hearts
    const hearts = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 4 + Math.random() * 6,
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.5,
        size: 15 + Math.random() * 25,
        color: ['#EF4444', '#EC4899', '#F472B6', '#FDA4AF'][Math.floor(Math.random() * 4)]
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="absolute -bottom-10 animate-float-heart"
                    style={{
                        left: `${heart.left}%`,
                        animationDuration: `${heart.animationDuration}s`,
                        animationDelay: `${heart.delay}s`,
                        opacity: heart.opacity,
                        color: heart.color
                    }}
                >
                    <Heart size={heart.size} fill="currentColor" />
                </div>
            ))}
            <style jsx>{`
                @keyframes float-heart {
                    0% { transform: translateY(10vh) scale(0.5); opacity: 0; }
                    20% { opacity: 0.8; }
                    100% { transform: translateY(-110vh) scale(1.5); opacity: 0; }
                }
                .animate-float-heart {
                    animation-name: float-heart;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}
