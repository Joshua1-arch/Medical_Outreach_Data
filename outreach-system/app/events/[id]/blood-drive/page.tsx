'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitDonation } from './actions';
import { useParams, useRouter } from 'next/navigation';

export default function BloodDrivePage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        donorName: '',
        donorVitals: {
            age: '',
            weight: '',
            bloodPressure: '',
            pcv: '',
        },
        serology: {
            hiv: false,
            hbsag: false,
            hcv: false,
            vdrl: false,
        },
        bloodGroup: {
            group: '',
            rh: '', // 'Positive' or 'Negative'
        },
    });

    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');
    const [deferReason, setDeferReason] = useState<string | null>(null);

    const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            donorVitals: {
                ...formData.donorVitals,
                [e.target.name]: e.target.value,
            },
        });
    };

    const handleSerologyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            serology: {
                ...formData.serology,
                [e.target.name]: e.target.checked,
            },
        });
    };

    const handleGroupChange = (field: 'group' | 'rh', value: string) => {
        setFormData({
            ...formData,
            bloodGroup: {
                ...formData.bloodGroup,
                [field]: value,
            },
        });
    };

    const validateStep1 = () => {
        const { weight, pcv, age, bloodPressure } = formData.donorVitals;
        if (!formData.donorName || !weight || !pcv || !age || !bloodPressure) {
            setErrorMessage('Please fill in all fields.');
            return false;
        }

        const weightNum = Number(weight);
        const pcvNum = Number(pcv);

        if (weightNum < 50) {
            setDeferReason('Donor weight is below 50kg.');
            return false;
        }
        if (pcvNum < 38) {
            setDeferReason('Donor PCV is below 38%.');
            return false;
        }

        setErrorMessage('');
        setDeferReason(null);
        return true;
    };

    const validateStep2 = () => {
        const { hiv, hbsag, hcv, vdrl } = formData.serology;
        if (hiv || hbsag || hcv || vdrl) {
            setDeferReason('Donor is reactive to TTI screening.');
            return false; // Stop process
        }
        setDeferReason(null);
        return true;
    };

    const nextStep = () => {
        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else if (step === 2) {
            if (validateStep2()) setStep(3);
        }
    };

    const handleSubmit = async () => {
        if (!formData.bloodGroup.group || !formData.bloodGroup.rh) {
            setErrorMessage('Please select Blood Group and RH Factor.');
            return;
        }

        setStatus('SUBMITTING');
        const submissionData = {
            donorName: formData.donorName,
            donorVitals: {
                age: Number(formData.donorVitals.age),
                weight: Number(formData.donorVitals.weight),
                pcv: Number(formData.donorVitals.pcv),
                bloodPressure: formData.donorVitals.bloodPressure
            },
            serology: formData.serology,
            bloodGroup: formData.bloodGroup
        };

        const result = await submitDonation(eventId, submissionData);

        if (result.success) {
            setStatus('SUCCESS');
        } else {
            setStatus('ERROR');
            setErrorMessage(result.message);
        }
    };

    // Render logic...
    if (status === 'SUCCESS') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
                    <h2 className="text-3xl font-bold text-green-600 mb-4">Donation Recorded!</h2>
                    <p className="text-gray-600 mb-6">The donor has been successfully screened and recorded.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        Process New Donor
                    </button>
                </div>
            </div>
        );
    }

    // If deferred (hard stop)
    if (deferReason) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border-l-4 border-red-500">
                    <h2 className="text-3xl font-bold text-red-600 mb-4">Donor Deferred</h2>
                    <p className="text-gray-800 text-lg mb-6">{deferReason}</p>
                    <p className="text-sm text-gray-500 mb-6">According to safety protocols, this donor cannot proceed.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Blood Donation Drive</h1>
                    <p className="mt-2 text-lg text-gray-600">Smart Screening & Record Keeping</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>01 Vitals</span>
                        <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>02 Screening</span>
                        <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>03 Grouping</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden relative min-h-[400px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: VITALS */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-8"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Donor Vitals</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="donorName"
                                            value={formData.donorName}
                                            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={formData.donorVitals.age}
                                                onChange={handleVitalChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="Years"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                value={formData.donorVitals.weight}
                                                onChange={handleVitalChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="Min 50kg"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PCV (%)</label>
                                            <input
                                                type="number"
                                                name="pcv"
                                                value={formData.donorVitals.pcv}
                                                onChange={handleVitalChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="Min 38%"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                                            <input
                                                type="text"
                                                name="bloodPressure"
                                                value={formData.donorVitals.bloodPressure}
                                                onChange={handleVitalChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="e.g. 120/80"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {errorMessage && <p className="text-red-500 mt-4 text-sm font-medium">{errorMessage}</p>}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
                                    >
                                        Next: Screening
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: SCREENING (TTI) */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-8"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">TTI Screening</h2>
                                <p className="text-gray-500 mb-6 text-sm">Mark any checkbox that is REACTIVE. All must be non-reactive to proceed.</p>

                                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    {['hiv', 'hbsag', 'hcv', 'vdrl'].map((key) => (
                                        <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                            <label htmlFor={key} className="text-lg font-medium text-gray-700 uppercase">{key}</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reactive?</span>
                                                <input
                                                    type="checkbox"
                                                    id={key}
                                                    name={key}
                                                    checked={(formData.serology as any)[key]}
                                                    onChange={handleSerologyChange}
                                                    className="w-6 h-6 text-red-600 rounded focus:ring-red-500 border-gray-300 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 font-medium hover:text-gray-700 px-4"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all"
                                    >
                                        Next: Grouping
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: GROUPING */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-8"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Blood Grouping</h2>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">ABO Group</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['A', 'B', 'AB', 'O'].map((g) => (
                                                <button
                                                    key={g}
                                                    onClick={() => handleGroupChange('group', g)}
                                                    className={`py-3 px-4 rounded-lg font-bold border-2 transition-all ${formData.bloodGroup.group === g
                                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                            : 'border-gray-200 text-gray-500 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Rh Factor</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {['Positive', 'Negative'].map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => handleGroupChange('rh', r)}
                                                    className={`py-3 px-4 rounded-lg font-bold border-2 transition-all ${formData.bloodGroup.rh === r
                                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                            : 'border-gray-200 text-gray-500 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {r === 'Positive' ? 'Positive (+)' : 'Negative (-)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {errorMessage && <p className="text-red-500 mb-6 text-sm font-medium">{errorMessage}</p>}

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-gray-500 font-medium hover:text-gray-700 px-4"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={status === 'SUBMITTING'}
                                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all text-lg flex items-center gap-2"
                                    >
                                        {status === 'SUBMITTING' ? 'Saving...' : 'Complete Donation'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
