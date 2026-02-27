'use client';

import { useState, useRef } from 'react';
import { createEvent } from '../actions';
import { useRouter } from 'next/navigation';
import {
    AlertCircle, CheckCircle, ArrowLeft, ArrowRight,
    Calendar, MapPin, Target, Image as ImageIcon,
    Package, Plus, Trash2, Lock, Pencil,
    FileText,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default function CreateEventForm() {
    const router = useRouter();
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [trackInventory, setTrackInventory] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [inventoryItems, setInventoryItems] = useState<
        { id: string; itemName: string; startingStock: number }[]
    >([]);

    const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show immediate local preview
        const reader = new FileReader();
        reader.onload = (ev) => setCoverImage(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload in background
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'med_outreach_unsigned');
        
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.secure_url) {
                setCoverImage(data.secure_url);
            }
        } catch (error) {
            console.error('Image upload failed', error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    /* ── Inventory helpers ── */
    const addInventoryItem = () =>
        setInventoryItems([
            ...inventoryItems,
            { id: Math.random().toString(36).substr(2, 9), itemName: '', startingStock: 0 },
        ]);

    const removeInventoryItem = (i: number) => {
        const n = [...inventoryItems];
        n.splice(i, 1);
        setInventoryItems(n);
    };

    const updateInventoryItem = (
        i: number,
        field: 'itemName' | 'startingStock',
        value: string | number,
    ) => {
        const n = [...inventoryItems];
        // @ts-ignore
        n[i] = { ...n[i], [field]: value };
        setInventoryItems(n);
    };

    /* ── Field style helper ── */
    const field =
        'w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#fbc037]/50 focus:border-[#fbc037] outline-none transition-all placeholder:text-slate-400 text-sm';
    const fieldWithIcon =
        'w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#fbc037]/50 focus:border-[#fbc037] outline-none transition-all placeholder:text-slate-400 text-sm';
    const label = 'block text-sm font-semibold text-slate-700 mb-1.5';
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Back link */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbc037]/10 border border-[#fbc037]/30 text-xs font-bold text-amber-700">
                    <Pencil size={11} /> New Outreach Proposal
                </span>
            </div>

            {/* ── Main Card ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Card header */}
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900">Campaign Details</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Phase 1: Provide the basic information for your outreach event. Once approved, you can build the data-collection form.
                    </p>
                </div>

                {/* Alerts */}
                <div className="px-8 pt-6 space-y-3">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
                            <CheckCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}
                </div>

                {/* Form body */}
                <form
                    action={async (formData) => {
                        setError('');
                        setSuccess('');

                        formData.append('coverImage', coverImage);

                        const validInventory = inventoryItems
                            .filter((i) => i.itemName.trim() !== '')
                            .map(({ id, ...rest }) => rest);
                        formData.append('inventory', JSON.stringify(validInventory));

                        const result = await createEvent(formData);

                        if (result.success) {
                            setSuccess(result.message);
                            setTimeout(() => router.push('/dashboard/my-events'), 1500);
                        } else {
                            setError(result.message);
                        }
                    }}
                    className="p-8 space-y-6"
                >
                    {/* Cover Image upload */}
                    <div className="space-y-2">
                        <label className={label}>Event Cover Image</label>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImagePick}
                            disabled={isUploadingImage}
                        />
                        <div
                            onClick={() => !isUploadingImage && fileRef.current?.click()}
                            className={`relative h-52 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#fbc037] hover:bg-[#fbc037]/5 cursor-pointer overflow-hidden transition-all group ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {coverImage ? (
                                <>
                                    <Image src={coverImage} fill className={`object-cover ${isUploadingImage ? 'opacity-30' : 'opacity-100'} transition-opacity`} priority alt="Event Cover" />
                                    {!isUploadingImage && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">Click to change image</span>
                                        </div>
                                    )}
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="animate-spin w-6 h-6 border-4 border-[#fbc037]/30 border-t-[#fbc037] rounded-full" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        disabled={isUploadingImage}
                                        onClick={(e) => { e.stopPropagation(); setCoverImage(''); }}
                                        className="absolute top-3 right-3 bg-red-500 text-white rounded-lg px-2.5 py-1 text-xs font-bold hover:bg-red-600 transition-colors shadow"
                                    >
                                        Remove
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#fbc037]/15 flex items-center justify-center transition-colors">
                                        {isUploadingImage 
                                            ? <span className="animate-spin w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full" />
                                            : <ImageIcon size={22} className="text-slate-400 group-hover:text-[#fbc037] transition-colors" />
                                        }
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                                        {isUploadingImage ? 'Uploading image...' : 'Click to upload cover image'}
                                    </p>
                                    <p className="text-xs text-slate-400">PNG, JPG, WEBP — recommended 1200×600px, max 5 MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Event Title */}
                    <div className="space-y-1.5">
                        <label htmlFor="title" className={label}>Event Title *</label>
                        <div className="relative">
                            <Pencil size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                className={fieldWithIcon}
                                placeholder="e.g., Community Health Screening 2025"
                            />
                        </div>
                    </div>

                    {/* Date + Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label htmlFor="date" className={label}>
                                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#fbc037]" /> Event Date *</span>
                            </label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    required
                                    min={today}
                                    className={fieldWithIcon}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="location" className={label}>
                                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#fbc037]" /> Location *</span>
                            </label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    required
                                    className={fieldWithIcon}
                                    placeholder="e.g., Central Community Hall"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1.5">
                        <label htmlFor="purpose" className={label}>
                            <span className="flex items-center gap-1.5"><Target size={13} className="text-[#fbc037]" /> Primary Purpose / Goal *</span>
                        </label>
                        <div className="relative">
                            <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                id="purpose"
                                name="purpose"
                                required
                                className={fieldWithIcon}
                                placeholder="e.g., Screen 500 patients for hypertension"
                            />
                        </div>
                    </div>

                    {/* Inventory toggle */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => {
                                setTrackInventory(!trackInventory);
                                if (!trackInventory && inventoryItems.length === 0) {
                                    setInventoryItems([{ id: Math.random().toString(36).substr(2, 9), itemName: '', startingStock: 0 }]);
                                }
                            }}
                            className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Package size={19} className="text-[#fbc037]" />
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        Inventory Planning <span className="text-slate-400 font-normal">(Optional)</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">Track starting stock for materials like test strips, gloves, etc.</p>
                                </div>
                            </div>
                            <div className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${trackInventory ? 'bg-[#fbc037]' : 'bg-slate-200'}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${trackInventory ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                            </div>
                        </button>

                        {trackInventory && (
                            <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                                {inventoryItems.map((item, idx) => (
                                    <div key={item.id} className="flex gap-3 items-end animate-in fade-in slide-in-from-left-2">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Item Name</label>
                                            <input
                                                type="text"
                                                value={item.itemName}
                                                onChange={(e) => updateInventoryItem(idx, 'itemName', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#fbc037]/50 focus:border-[#fbc037] outline-none transition-all"
                                                placeholder="e.g., Malaria Test Strips"
                                            />
                                        </div>
                                        <div className="w-28">
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Qty</label>
                                            <input
                                                type="number"
                                                value={item.startingStock}
                                                onChange={(e) => updateInventoryItem(idx, 'startingStock', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#fbc037]/50 focus:border-[#fbc037] outline-none transition-all"
                                                min="0"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeInventoryItem(idx)}
                                            className="p-2.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addInventoryItem}
                                    className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#fbc037] transition-colors"
                                >
                                    <Plus size={15} /> Add Another Item
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <label htmlFor="reason" className={label}>
                            <span className="flex items-center gap-1.5"><FileText size={13} className="text-[#fbc037]" /> Reason / Justification <span className="font-normal text-slate-400">(Optional)</span></span>
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#fbc037]/50 focus:border-[#fbc037] outline-none transition-all placeholder:text-slate-400 text-sm resize-none"
                            placeholder="Why is this outreach needed now?"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label htmlFor="description" className={label}>Additional Details</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#fbc037]/50 focus:border-[#fbc037] outline-none transition-all placeholder:text-slate-400 text-sm resize-none"
                            placeholder="Logistics, team requirements, special notes…"
                        />
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Link
                            href="/dashboard"
                            className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </Link>
                        <SubmitButton className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#fbc037] text-slate-900 font-bold text-sm hover:bg-yellow-400 shadow-md hover:shadow-lg transition-all active:scale-[0.99]">
                            <Target size={16} /> Submit Proposal
                            <ArrowRight size={16} />
                        </SubmitButton>
                    </div>
                </form>
            </div>

            {/* HIPAA notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Lock size={11} />
                <span>All data is encrypted and stored under HIPAA compliance standards.</span>
            </div>
        </div>
    );
}
