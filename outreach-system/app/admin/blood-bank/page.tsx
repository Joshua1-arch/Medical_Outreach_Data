'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCompatibleDonors } from './actions';
import { Spinner } from '@/components/ui/Spinner';
import { Droplet, Heart, Search, Users, Phone, MapPin, Calendar, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BloodBankSearch() {
    const [targetGroup, setTargetGroup] = useState('');
    const [targetRh, setTargetRh] = useState('');
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!targetGroup || !targetRh) return;

        setLoading(true);
        const type = `${targetGroup}${targetRh === 'Positive' ? '+' : '-'}`;
        const result = await searchCompatibleDonors(type);

        if (result.success) {
            setDonors(result.donors || []);
        } else {
            setDonors([]);
        }
        setLoading(false);
        setHasSearched(true);
    };

    const targetBloodType = targetGroup && targetRh ? `${targetGroup}${targetRh === 'Positive' ? '+' : '-'}` : '...';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                        <Droplet size={24} fill="currentColor" className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Blood Bank Search</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Locate compatible donors for immediate patient requirements.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold">
                    <ShieldCheck size={14} />
                    LIVE DONOR DATABASE
                </div>
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                {/* Background glow */}
                <div className="absolute top-0 right-0 size-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
                
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Search size={14} />
                    Patient Blood Requirement
                </h3>

                <div className="flex flex-col md:flex-row gap-6 items-end relative">
                    <div className="w-full md:w-1/3 space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Blood Group</label>
                        <select
                            value={targetGroup}
                            onChange={(e) => setTargetGroup(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select Group</option>
                            {['A', 'B', 'AB', 'O'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="w-full md:w-1/3 space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">Rh Factor</label>
                        <select
                            value={targetRh}
                            onChange={(e) => setTargetRh(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select Factor</option>
                            <option value="Positive">Positive (+)</option>
                            <option value="Negative">Negative (-)</option>
                        </select>
                    </div>

                    <div className="w-full md:w-1/3">
                        <button
                            onClick={handleSearch}
                            disabled={!targetGroup || !targetRh || loading}
                            className={`w-full h-12 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${!targetGroup || !targetRh || loading
                                ? 'bg-slate-200 cursor-not-allowed shadow-none'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20 active:scale-[0.98]'
                                }`}
                        >
                            {loading ? <Spinner className="text-white" /> : (
                                <>
                                    <Droplet size={16} />
                                    Find Donors For {targetBloodType}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {hasSearched ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold text-slate-900">
                                Compatible Donors
                                <span className="ml-3 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded-full font-black uppercase">
                                    {donors.length} FOUND
                                </span>
                            </h3>
                            {donors.length > 0 && (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    All Fit to Donate
                                </div>
                            )}
                        </div>

                        {donors.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <div className="size-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300 shadow-sm">
                                    <Search size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">No compatible donors found</h4>
                                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Try expanding your criteria or checking the central inventory systems for {targetBloodType} blood.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {donors.map((donor, i) => (
                                    <motion.div
                                        key={donor._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-red-100 transition-all group"
                                    >
                                        <div className="p-7 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{donor.donorName}</h4>
                                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2">
                                                        <span>{donor.donorVitals.age} Years</span>
                                                        <span className="size-1 rounded-full bg-slate-200" />
                                                        <span>{donor.donorVitals.weight}kg</span>
                                                    </p>
                                                </div>
                                                <div className="size-14 rounded-2xl bg-red-600 text-white flex flex-col items-center justify-center shadow-lg shadow-red-500/20 transform group-hover:scale-110 transition-transform">
                                                    <span className="text-xl font-black leading-none">{donor.bloodGroup.group}</span>
                                                    <span className="text-[10px] font-black">{donor.bloodGroup.rh === 'Positive' ? 'POS' : 'NEG'}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Packed Cell Volume</p>
                                                    <p className="text-sm font-black text-slate-700">{donor.donorVitals.pcv}%</p>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Pressure</p>
                                                    <p className="text-sm font-black text-slate-700">{donor.donorVitals.bloodPressure}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                                                    <Calendar size={14} className="text-red-400 shrink-0" />
                                                    <span>Last Screening: {new Date(donor.createdAt).toLocaleDateString('en-GB')}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                                                    <MapPin size={14} className="text-red-400 shrink-0" />
                                                    <span>Registered at Site-Alpha</span>
                                                </div>
                                            </div>

                                            <button className="w-full h-11 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                                                <Phone size={14} />
                                                Contact Donor
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-12 text-center"
                    >
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="size-16 rounded-3xl bg-red-50 text-red-400 flex items-center justify-center mx-auto border border-red-100/50">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Ready to search?</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Select a blood group and factor above to find registered donors who are medically cleared for donation.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
