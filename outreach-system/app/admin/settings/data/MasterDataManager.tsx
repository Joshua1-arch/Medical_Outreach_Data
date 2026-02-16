'use client';

import { useState } from 'react';
import { addOption, removeOption } from './actions';
import { Trash, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Initial categories for the user to pick from
const CATEGORIES = [
    { id: 'drugs', label: 'Drugs List' },
    { id: 'diagnosis', label: 'Diagnosis List' },
    { id: 'locations', label: 'Locations' },
];

export default function MasterDataManager({ initialData }: { initialData: any[] }) {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
    const [newOption, setNewOption] = useState('');
    const [message, setMessage] = useState('');

    const currentList = initialData.find((d: any) => d.category === selectedCategory)?.options || [];

    const handleAdd = async () => {
        if (!newOption.trim()) return;
        const result = await addOption(selectedCategory, newOption.trim());
        if (result.success) {
            setNewOption('');
            setMessage('Added successfully');
            setTimeout(() => setMessage(''), 3000);
            // Ideally revalidate client-side via revalidatePath
        } else {
            setMessage(result.message);
        }
    };

    const handleRemove = async (opt: string) => {
        if (!confirm(`Remove "${opt}"?`)) return;
        await removeOption(selectedCategory, opt);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-brand-dark">Edit Lists</h2>

            {/* Category Selector */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === cat.id 
                                ? 'bg-brand-dark text-white' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Add New Option */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder={`Add new item to ${CATEGORIES.find(c => c.id === selectedCategory)?.label}...`}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} disabled={!newOption.trim()}>
                    <Plus size={16} /> Add
                </Button>
            </div>

            {message && <div className="text-sm text-green-600 mb-4 flex items-center gap-1"><Check size={14}/> {message}</div>}

            {/* List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {currentList.length === 0 && (
                    <p className="text-slate-400 text-sm italic text-center py-4">No items in this list yet.</p>
                )}
                {currentList.map((opt: string) => (
                    <div key={opt} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg group hover:bg-slate-100 transition-colors">
                        <span className="font-medium text-slate-700">{opt}</span>
                        <button 
                            onClick={() => handleRemove(opt)} 
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
