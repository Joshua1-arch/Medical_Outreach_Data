'use client';

import { useState } from 'react';
import { createEvent } from '../actions';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Calendar, MapPin, Target, Image as ImageIcon, Package, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function CreateEventForm() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [trackInventory, setTrackInventory] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<{ id: string; itemName: string; startingStock: number }[]>([]);

    const addInventoryItem = () => {
        setInventoryItems([...inventoryItems, { id: Math.random().toString(36).substr(2, 9), itemName: '', startingStock: 0 }]);
    };

    const removeInventoryItem = (index: number) => {
        const newItems = [...inventoryItems];
        newItems.splice(index, 1);
        setInventoryItems(newItems);
    };

    const updateInventoryItem = (index: number, field: 'itemName' | 'startingStock', value: string | number) => {
        const newItems = [...inventoryItems];
        // @ts-ignore - keeping for safety but the types are now stricter
        newItems[index] = { ...newItems[index], [field]: value };
        setInventoryItems(newItems);
    };


    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-dark transition-colors font-medium">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                <div className="mb-8 border-b border-slate-100 pb-6">
                    <h1 className="text-3xl font-serif font-bold text-brand-dark flex items-center gap-3">
                        <Target className="text-brand-gold" size={32} />
                        Submit Outreach Proposal
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Phase 1: Propose your event details. Once approved, you can build the form.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-800">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <p>{success}</p>
                    </div>
                )}


                <form action={async (formData) => {
                    setError('');
                    setSuccess('');

                    formData.append('coverImage', coverImage);

                    // Filter out empty items
                    // Filter out empty items and strip IDs
                    const validInventory = inventoryItems
                        .filter(i => i.itemName.trim() !== '')
                        .map(({ id, ...rest }) => rest);
                    
                    formData.append('inventory', JSON.stringify(validInventory));

                    const result = await createEvent(formData);

                    if (result.success) {
                        setSuccess(result.message);
                        setTimeout(() => {
                            router.push('/dashboard/my-events');
                        }, 1500);
                    } else {
                        setError(result.message);
                    }
                }} className="space-y-6">
                    {/* Cloudinary Widget */}
                    <div>
                        <label className="block text-sm font-bold text-brand-dark mb-2">Event Cover Image</label>
                        <CldUploadWidget
                            uploadPreset="med_outreach_unsigned"
                            options={{
                                sources: ['local'],
                                multiple: false,
                                maxFiles: 1,
                                showPoweredBy: false,
                                clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                                styles: {
                                    palette: {
                                        window: "#FFFFFF",
                                        sourceBg: "#F8FAFC",
                                        windowBorder: "#E2E8F0",
                                        tabIcon: "#0F172A",
                                        inactiveTabIcon: "#64748B",
                                        menuIcons: "#0F172A",
                                        link: "#D4AF37",
                                        action: "#D4AF37",
                                        inProgress: "#D4AF37",
                                        complete: "#10B981",
                                        error: "#EF4444",
                                        textDark: "#0F172A",
                                        textLight: "#FFFFFF"
                                    }
                                }
                            }}
                            onSuccess={(result) => {
                                // @ts-ignore
                                setCoverImage(result?.info?.secure_url);
                            }}
                        >
                            {({ open }) => (
                                <div className="flex flex-col md:flex-row gap-8 items-start mb-2">
                                    {/* Left Preview */}
                                    <div
                                        className="relative w-full md:w-64 h-48 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-brand-gold rounded-xl flex items-center justify-center shrink-0 cursor-pointer overflow-hidden transition-all group"
                                        onClick={() => open()}
                                    >
                                        {coverImage ? (
                                            <Image src={coverImage} fill className="object-cover" alt="Event Cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="text-slate-300 mx-auto mb-2 group-hover:text-brand-gold transition-colors" size={32} />
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Preview</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Controls */}
                                    <div className="flex-1 space-y-3 pt-1">
                                        <h3 className="font-bold text-brand-dark text-lg">Event Cover Image</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Upload a high-quality banner image to make your outreach mission stand out.
                                            <br />
                                            <span className="text-xs text-slate-400">Recommended size: 1200x600px. Max: 5MB.</span>
                                        </p>

                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="px-5 py-2.5 bg-brand-cream border border-brand-gold/50 text-brand-dark rounded-lg font-bold hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <ImageIcon size={18} />
                                                {coverImage ? 'Change Image' : 'Upload Image'}
                                            </button>

                                            {coverImage && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCoverImage('');
                                                    }}
                                                    className="px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CldUploadWidget>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-brand-dark mb-1">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="e.g., Community Health Screening 2024"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="date" className="block text-sm font-bold text-brand-dark mb-1 flex items-center gap-1">
                                    <Calendar size={14} className="text-brand-gold" /> Event Date *
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-bold text-brand-dark mb-1 flex items-center gap-1">
                                    <MapPin size={14} className="text-brand-gold" /> Location *
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g., Central Community Hall"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="purpose" className="block text-sm font-bold text-brand-dark mb-1">
                                Primary Purpose / Goal *
                            </label>
                            <input
                                type="text"
                                id="purpose"
                                name="purpose"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="e.g., Screen 500 patients for hypertension"
                            />
                        </div>

                        {/* Inventory Section */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            {/* Toggle Header */}
                            <button
                                type="button"
                                onClick={() => {
                                    setTrackInventory(!trackInventory);
                                    if (!trackInventory && inventoryItems.length === 0) {
                                        setInventoryItems([{ id: Math.random().toString(36).substr(2, 9), itemName: '', startingStock: 0 }]);
                                    }
                                }}
                                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Package size={20} className="text-brand-gold" />
                                    <div>
                                        <p className="font-bold text-brand-dark">Inventory Planning <span className="text-slate-400 font-normal text-sm">(Optional)</span></p>
                                        <p className="text-xs text-slate-400">Track starting stock for materials like test strips, gloves, etc.</p>
                                    </div>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${
                                    trackInventory ? 'bg-brand-gold' : 'bg-slate-300'
                                }`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                        trackInventory ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </div>
                            </button>

                            {/* Expandable Content */}
                            {trackInventory && (
                                <div className="p-6 bg-white border-t border-slate-200 space-y-3">
                                    {inventoryItems.map((item, index) => (
                                        <div key={item.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Item Name</label>
                                                <input
                                                    type="text"
                                                    value={item.itemName}
                                                    onChange={(e) => updateInventoryItem(index, 'itemName', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                                    placeholder="e.g. Malaria Strips"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={item.startingStock}
                                                    onChange={(e) => updateInventoryItem(index, 'startingStock', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                                                    min="0"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeInventoryItem(index)}
                                                className="p-2.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addInventoryItem}
                                        className="mt-2 text-sm font-bold text-brand-dark flex items-center gap-2 hover:text-brand-gold transition-colors"
                                    >
                                        <Plus size={16} /> Add Another Item
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-bold text-brand-dark mb-1">
                                Reason/Justification (Optional)
                            </label>
                            <textarea
                                id="reason"
                                name="reason"
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Why is this outreach needed now?"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-brand-dark mb-1">
                                Additional Details
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Logistics, team requirements, etc."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 text-slate-500 hover:text-brand-dark font-medium transition-colors"
                        >
                            Cancel
                        </Link>
                        <SubmitButton>
                            <Target size={18} /> Submit Proposal
                        </SubmitButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
