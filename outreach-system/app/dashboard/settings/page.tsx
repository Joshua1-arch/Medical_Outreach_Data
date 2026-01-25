'use client';
import { useActionState } from 'react';
import { changePassword } from '../actions';
import { Button } from '@/components/ui/Button';
import { Lock, Save } from 'lucide-react';

const initialState = {
    success: false,
    message: ''
};

export default function SettingsPage() {
    const [state, formAction, isPending] = useActionState(changePassword, initialState);

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-serif font-bold text-brand-dark">Account Settings</h1>
                <p className="text-slate-500 mt-1">Manage your security preferences.</p>
            </div>

            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                    <div className="p-2 bg-brand-cream text-brand-gold rounded-lg">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-brand-dark">Change Password</h2>
                        <p className="text-sm text-slate-500">Update your account password</p>
                    </div>
                </div>

                <form action={formAction} className="space-y-4">
                    {state?.message && (
                        <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-brand-dark mb-1">Current Password</label>
                        <input name="currentPassword" type="password" required className="w-full px-4 py-3 bg-brand-cream rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-dark mb-1">New Password</label>
                        <input name="newPassword" type="password" required className="w-full px-4 py-3 bg-brand-cream rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-dark mb-1">Confirm New Password</label>
                        <input name="confirmPassword" type="password" required className="w-full px-4 py-3 bg-brand-cream rounded-lg focus:ring-2 focus:ring-brand-gold/50 outline-none transition-all" />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" isLoading={isPending}>
                            <Save size={18} /> Update Password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
