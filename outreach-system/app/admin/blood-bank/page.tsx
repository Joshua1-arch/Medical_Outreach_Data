'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCompatibleDonors } from './actions';
import { Spinner } from '@/components/ui/Spinner';

// Icons
const DropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-white" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);

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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-100 rounded-xl text-red-600">
                    <DropIcon />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Blood Bank Search</h1>
                    <p className="text-gray-500">Locate compatible donors for immediate patient needs.</p>
                </div>
            </div>

            {/* Search Interface */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Patient Requirement</h2>

                <div className="flex flex-col md:flex-row gap-8 items-end">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient's Blood Group</label>
                        <select
                            value={targetGroup}
                            onChange={(e) => setTargetGroup(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                            <option value="">Select Group</option>
                            {['A', 'B', 'AB', 'O'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rh Factor</label>
                        <select
                            value={targetRh}
                            onChange={(e) => setTargetRh(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                            <option value="">Select Rh</option>
                            <option value="Positive">Positive (+)</option>
                            <option value="Negative">Negative (-)</option>
                        </select>
                    </div>

                    <div className="w-full md:w-1/3">
                        <button
                            onClick={handleSearch}
                            disabled={!targetGroup || !targetRh || loading}
                            className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-md transition-all ${!targetGroup || !targetRh || loading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-1'
                                }`}
                        >
                            {loading ? <Spinner className="text-white" /> : `Find Donors for ${targetBloodType}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <AnimatePresence>
                {hasSearched && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Found {donors.length} Compatible {donors.length === 1 ? 'Donor' : 'Donors'}
                            </h2>
                            {donors.length > 0 && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    All are Fit to Donate
                                </span>
                            )}
                        </div>

                        {donors.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-lg">No compatible donors found for {targetBloodType}.</p>
                                <p className="text-sm text-gray-400 mt-2">Try expanding your search or checking local inventory.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {donors.map((donor) => (
                                    <div key={donor._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{donor.donorName}</h3>
                                                    <p className="text-gray-500 text-sm">Age: {donor.donorVitals.age} • {donor.donorVitals.weight}kg</p>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                        {donor.bloodGroup.group}
                                                        {donor.bloodGroup.rh === 'Positive' ? '+' : '-'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">PCV</span>
                                                    <span className="font-medium text-gray-800">{donor.donorVitals.pcv}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">BP</span>
                                                    <span className="font-medium text-gray-800">{donor.donorVitals.bloodPressure}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Date</span>
                                                    <span className="font-medium text-gray-800">{new Date(donor.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                                <HeartIcon />
                                                Contact Donor
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
