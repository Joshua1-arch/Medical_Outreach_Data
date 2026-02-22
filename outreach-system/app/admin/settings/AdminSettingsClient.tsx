'use client';

import { useActionState, useState, useRef, useTransition } from 'react';
import { changePassword, updateUserProfile } from '@/app/dashboard/actions';
import {
    User, ShieldCheck, BellRing, Settings as SettingsIcon,
    Lock, Save, AlertTriangle, Globe, Camera,
    CheckCircle2, XCircle, ChevronRight, FileText, FileSpreadsheet,
    Phone, Stethoscope, Clock, Shield
} from 'lucide-react';

type AdminData = {
    name: string;
    email: string;
    phone: string;
    medicalRole: string;
    profileImage: string;
    timezone: string;
    exportFormat: string;
};

const ADMIN_ROLES = ['Super Administrator', 'System Manager', 'Data Analyst', 'Support Staff'];

const TIMEZONES = [
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
    { label: 'WAT – West Africa Time (UTC+1)', value: 'Africa/Lagos' },
    { label: 'CAT – Central Africa Time (UTC+2)', value: 'Africa/Harare' },
    { label: 'EAT – East Africa Time (UTC+3)', value: 'Africa/Nairobi' },
    { label: 'GMT – Greenwich Mean Time', value: 'Europe/London' },
    { label: 'CET – Central European Time (UTC+1)', value: 'Europe/Paris' },
    { label: 'EST – Eastern Standard Time (UTC-5)', value: 'America/New_York' },
    { label: 'CST – Central Standard Time (UTC-6)', value: 'America/Chicago' },
    { label: 'PST – Pacific Standard Time (UTC-8)', value: 'America/Los_Angeles' },
];

const profileInitial = { success: false, message: '' };
const passwordInitial = { success: false, message: '' };

function Toast({ state }: { state: { success: boolean; message: string } }) {
    if (!state.message) return null;
    return (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold border ${state.success
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
            : 'bg-red-50 text-red-800 border-red-100'
            }`}>
            {state.success ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <XCircle size={16} className="text-red-500 shrink-0" />}
            {state.message}
        </div>
    );
}

export default function AdminSettingsClient({ admin }: { admin: AdminData }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [tfaEnabled, setTfaEnabled] = useState(false);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [auditNotifs, setAuditNotifs] = useState(true);
    const [exportFmt, setExportFmt] = useState(admin.exportFormat);
    const [previewImage, setPreviewImage] = useState(admin.profileImage);
    const fileRef = useRef<HTMLInputElement>(null);

    const [profileState, profileAction, profilePending] = useActionState(updateUserProfile, profileInitial);
    const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, passwordInitial);

    const sidebarItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: BellRing },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    ];

    const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Admin Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your administrator profile, security, and system preferences.</p>
                </div>
                <span className="px-3 py-1.5 bg-[#1e293b] text-[#fbc037] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-[#fbc037]/20">
                    <Shield size={11} /> Super Admin
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* ── Sidebar ── */}
                <aside className="lg:col-span-3">
                    <nav className="space-y-1 sticky top-24">
                        {sidebarItems.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                        ? 'bg-[#fbc037]/10 text-slate-900 border border-[#fbc037]/25 shadow-sm'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon size={17} className={active ? 'text-[#fbc037]' : ''} />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {active && <ChevronRight size={14} className="text-[#fbc037]" />}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* ── Main Content ── */}
                <div className="lg:col-span-9 space-y-6">

                    {/* ════════════ PROFILE TAB ════════════ */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-7 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Admin Profile</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Your name, role, and contact details for the system.</p>
                            </div>

                            <form action={profileAction} className="p-7 space-y-8">
                                <Toast state={profileState} />

                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden">
                                            {previewImage
                                                ? <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                                : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#fbc037]">
                                                        {admin.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#fbc037] flex items-center justify-center shadow-md hover:bg-yellow-400 transition-colors"
                                        >
                                            <Camera size={13} className="text-slate-900" />
                                        </button>
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                                        <input type="hidden" name="profileImage" value={previewImage} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{admin.name}</p>
                                        <p className="text-sm text-slate-500">{admin.email}</p>
                                        <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-[#fbc037] hover:underline mt-1">
                                            Change photo
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <User size={13} className="text-slate-400" /> Full Name
                                        </label>
                                        <input name="name" defaultValue={admin.name} required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <Phone size={13} className="text-slate-400" /> Phone Number
                                        </label>
                                        <input name="phone" defaultValue={admin.phone} placeholder="+234 800 000 0000" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all" />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                            <Stethoscope size={13} className="text-slate-400" /> Admin Role
                                        </label>
                                        <select name="medicalRole" defaultValue={admin.medicalRole} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all appearance-none">
                                            <option value="">Select your admin role…</option>
                                            {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2 border-t border-slate-50">
                                    <button type="submit" disabled={profilePending} className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#fbc037] text-slate-900 font-bold text-sm hover:bg-yellow-400 shadow-md shadow-[#fbc037]/20 transition-all disabled:opacity-60">
                                        {profilePending ? <span className="animate-spin w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> : <Save size={16} />}
                                        Save Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ════════════ SECURITY TAB ════════════ */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-7 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Manage your admin password and account security preferences.</p>
                            </div>

                            <div className="p-7 space-y-8">
                                {/* 2FA */}
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication</h3>
                                        <p className="text-sm text-slate-500 max-w-sm">Required for admin accounts. Adds a code requirement on every sign-in.</p>
                                        {tfaEnabled && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full mt-1">
                                                <CheckCircle2 size={11} /> Enabled
                                            </span>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setTfaEnabled(!tfaEnabled)} className={`relative w-12 h-6 rounded-full transition-colors shrink-0 mt-1 ${tfaEnabled ? 'bg-[#fbc037]' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-all ${tfaEnabled ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="border-t border-slate-100 pt-8">
                                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" /> Change Password
                                    </h3>
                                    <form action={passwordAction} className="space-y-5 max-w-xl">
                                        <Toast state={passwordState} />
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                            <input name="currentPassword" type="password" required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">New Password</label>
                                            <input name="newPassword" type="password" required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all" />
                                            <p className="text-xs text-slate-400">Minimum 6 characters with numbers and symbols.</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                            <input name="confirmPassword" type="password" required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all" />
                                        </div>
                                        <button type="submit" disabled={passwordPending} className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#fbc037] text-slate-900 font-bold text-sm hover:bg-yellow-400 shadow-md shadow-[#fbc037]/20 transition-all disabled:opacity-60">
                                            {passwordPending ? <span className="animate-spin w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> : <Lock size={16} />}
                                            Update Password
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════ NOTIFICATIONS TAB ════════════ */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-7 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Admin Alert Preferences</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Control which system-level alerts you receive.</p>
                            </div>
                            <div className="p-7 space-y-6">
                                {[
                                    { label: 'System Email Alerts', desc: 'Receive emails for new user registrations, event submissions, and system errors.', value: emailNotifs, set: setEmailNotifs },
                                    { label: 'Audit Log Digest', desc: 'Receive a daily summary of critical admin actions performed on the platform.', value: auditNotifs, set: setAuditNotifs },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start justify-between gap-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-slate-900">{item.label}</h3>
                                            <p className="text-sm text-slate-500 max-w-sm">{item.desc}</p>
                                        </div>
                                        <button type="button" onClick={() => item.set(!item.value)} className={`relative w-12 h-6 rounded-full transition-colors shrink-0 mt-1 ${item.value ? 'bg-[#fbc037]' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-all ${item.value ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                                <div className="pt-2 flex items-center gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                                    <BellRing size={16} className="text-amber-500 shrink-0" />
                                    <p className="text-sm text-amber-700 font-medium">Full webhook and in-app admin notification routing is coming in the next release.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════ PREFERENCES TAB ════════════ */}
                    {activeTab === 'preferences' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-7 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Region &amp; Export Preferences</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Set your time zone and preferred default export format for reports.</p>
                            </div>
                            <form action={profileAction} className="p-7 space-y-7">
                                <Toast state={profileState} />
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                        <Clock size={14} className="text-slate-400" /> Default Time Zone
                                    </label>
                                    <select name="timezone" defaultValue={admin.timezone} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/40 text-sm focus:bg-white focus:ring-2 focus:ring-[#fbc037]/40 focus:border-[#fbc037] outline-none transition-all appearance-none">
                                        {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                                    </select>
                                    <p className="text-xs text-slate-400">Used for event timestamps, CSV exports, and audit log timestamps.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                        Default Export Format
                                    </label>
                                    <input type="hidden" name="exportFormat" value={exportFmt} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { value: 'csv', icon: FileSpreadsheet, label: 'CSV Spreadsheet', desc: 'Best for Excel, Google Sheets, and data analysis.' },
                                            { value: 'word', icon: FileText, label: 'Word Document', desc: 'Best for reports, printing, and official documentation.' },
                                        ].map((fmt) => (
                                            <button key={fmt.value} type="button" onClick={() => setExportFmt(fmt.value)} className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${exportFmt === fmt.value ? 'border-[#fbc037] bg-[#fbc037]/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <div className={`p-2.5 rounded-lg shrink-0 ${exportFmt === fmt.value ? 'bg-[#fbc037]/20 text-[#b8860b]' : 'bg-slate-100 text-slate-500'}`}>
                                                    <fmt.icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900">{fmt.label}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{fmt.desc}</p>
                                                </div>
                                                {exportFmt === fmt.value && <CheckCircle2 size={16} className="text-[#fbc037] shrink-0 ml-auto mt-0.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2 border-t border-slate-50">
                                    <button type="submit" disabled={profilePending} className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#fbc037] text-slate-900 font-bold text-sm hover:bg-yellow-400 shadow-md shadow-[#fbc037]/20 transition-all disabled:opacity-60">
                                        {profilePending ? <span className="animate-spin w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> : <Save size={16} />}
                                        Save Preferences
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
