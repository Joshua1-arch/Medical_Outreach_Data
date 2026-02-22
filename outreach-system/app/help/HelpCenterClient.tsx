'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
    FileText, BriefcaseMedical, Package, Calendar,
    BarChart3, Settings, Search, TrendingUp, ChevronRight,
    Ticket, MessageCircle, LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';

const categories = [
    { title: 'Form Builder', desc: 'Creating and managing custom outreach forms and data collection templates.', icon: FileText },
    { title: 'Patient Records', desc: 'Managing HIPAA-compliant data, patient profiles, and secure health histories.', icon: BriefcaseMedical },
    { title: 'Inventory & Stock', desc: 'Tracking supplies, medical kits, and medication levels across multiple locations.', icon: Package },
    { title: 'Campaign Management', desc: 'Organizing outreach events, field clinics, and volunteer scheduling.', icon: Calendar },
    { title: 'Analytics', desc: 'Viewing impact metrics, real-time reports, and outreach performance data.', icon: BarChart3 },
    { title: 'Account Settings', desc: 'User permissions, multi-factor authentication, and organizational profile management.', icon: Settings },
];

const guides = [
    'Setting up HIPAA-compliant data encryption',
    'How to export outreach campaign analytics',
    'Managing volunteer access levels',
    'Troubleshooting mobile sync issues in remote areas',
    'Creating your first medical outreach form',
    'Inviting team members and assigning roles',
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function HelpCenterClient({ user }: { user?: any }) {
    const [query, setQuery] = useState('');

    const filteredGuides = guides.filter((g) =>
        g.toLowerCase().includes(query.toLowerCase())
    );

    const filteredCategories = categories.filter(
        (c) =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.desc.toLowerCase().includes(query.toLowerCase())
    );

    const showAll = query.trim() === '';

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">

            {/* ── Sticky Header ── */}
            <header className="flex h-16 items-center justify-between px-6 md:px-10 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#fbc037] text-slate-900 shrink-0">
                        <BriefcaseMedical size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">ReachPoint</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {['Guides', 'Forms', 'Status'].map((item) => (
                        <a key={item} href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            {item}
                        </a>
                    ))}
                    {user ? (
                        <Link
                            href={user.role === 'admin' ? '/admin' : '/dashboard'}
                            className="h-10 px-5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <LayoutDashboard size={16} />
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="h-10 px-6 rounded-lg bg-[#fbc037] text-slate-900 text-sm font-bold hover:bg-yellow-400 transition-all flex items-center"
                        >
                            Sign In
                        </Link>
                    )}
                </nav>
            </header>

            {/* ── Hero / Search ── */}
            <section className="bg-[#f8f7f5] py-20 px-6 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto text-center space-y-8"
                >
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tight">Help Center</h1>
                        <p className="text-lg text-slate-500">Search for guides, articles, or troubleshooting</p>
                    </div>

                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#fbc037] transition-colors pointer-events-none">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="How can we help you today?"
                            className="w-full h-16 pl-14 pr-32 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-[#fbc037]/10 focus:border-[#fbc037] outline-none transition-all text-lg"
                        />
                        <button
                            onClick={() => {}}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl bg-[#fbc037] text-slate-900 font-bold hover:bg-yellow-400 transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* Quick links */}
                    <div className="flex flex-wrap justify-center gap-2 text-sm">
                        {['Getting Started', 'Billing', 'Data Export', 'Security'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setQuery(tag)}
                                className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-[#fbc037] hover:text-slate-900 transition-all text-xs font-semibold"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── Categories Grid ── */}
            <section className="max-w-7xl mx-auto py-20 px-6 md:px-10 space-y-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Browse by Category</h2>
                    {!showAll && (
                        <p className="text-sm text-slate-400">
                            Showing results for <span className="font-semibold text-slate-700">"{query}"</span>
                        </p>
                    )}
                </div>

                {(showAll ? categories : filteredCategories).length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Search size={40} className="mx-auto mb-4 opacity-30" />
                        <p className="font-semibold">No categories match your search</p>
                    </div>
                ) : (
                    <motion.div
                        key={query}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {(showAll ? categories : filteredCategories).map((cat, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="size-12 rounded-xl bg-[#fbc037]/10 text-[#fbc037] flex items-center justify-center mb-6 group-hover:bg-[#fbc037] group-hover:text-slate-900 transition-colors">
                                    <cat.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{cat.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* ── Popular Guides + Support card ── */}
            <section className="max-w-7xl mx-auto pb-24 px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Popular Guides */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center gap-3 text-[#fbc037]">
                            <TrendingUp size={24} />
                            <h2 className="text-2xl font-bold text-slate-900">Popular Guides</h2>
                        </div>

                        <div className="space-y-2">
                            {(showAll ? guides : filteredGuides).map((guide, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="w-full flex items-center justify-between p-6 rounded-2xl hover:bg-slate-50 transition-colors group text-left border border-transparent hover:border-slate-100"
                                >
                                    <span className="font-semibold text-slate-700 group-hover:text-slate-900">{guide}</span>
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-[#fbc037] transition-colors shrink-0" />
                                </motion.button>
                            ))}

                            {!showAll && filteredGuides.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="font-semibold">No guides match your search</p>
                                    <button onClick={() => setQuery('')} className="mt-2 text-sm text-[#fbc037] font-semibold hover:underline">
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#101827] rounded-3xl p-8 text-white space-y-8 shadow-xl relative overflow-hidden sticky top-24"
                        >
                            {/* glow */}
                            <div className="absolute top-0 right-0 size-40 bg-[#fbc037]/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

                            <div className="space-y-4 relative">
                                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                    <MessageCircle size={20} className="text-[#fbc037]" />
                                </div>
                                <h3 className="text-2xl font-bold">Still need help?</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Our support team is available 24/7 for urgent technical assistance and account issues.
                                </p>
                            </div>

                            <div className="space-y-3 relative">
                                <button className="w-full h-12 rounded-xl bg-[#fbc037] text-slate-900 font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                                    <Ticket size={18} />
                                    <span>Submit a Support Ticket</span>
                                </button>
                                <button className="w-full h-12 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                    <MessageCircle size={18} />
                                    <span>Live Chat with an Expert</span>
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-800 space-y-4 relative">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Support Status</p>
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                    <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>All systems operational</span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    Average response time: <span className="text-slate-400 font-semibold">~2 minutes</span>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-100 py-12 px-6 md:px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <BriefcaseMedical size={18} className="text-[#fbc037]" />
                        <span className="text-sm font-bold text-slate-400">ReachPoint</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance'].map((link) => (
                            <a key={link} href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>

                    <p className="text-xs font-bold text-slate-400">© 2026 ReachPoint. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
