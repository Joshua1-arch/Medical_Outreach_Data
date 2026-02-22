import dbConnect from "@/lib/db";
import User from "@/models/User";
import { approveUser, rejectUser, deleteUser, approveDeletionRequest, dismissDeletionRequest } from "../actions";
import { Check, X, Shield, Users as UsersIcon, Trash2, AlertTriangle, UserX, Search, UserCheck, ShieldAlert } from "lucide-react";
import UserStatusToggle from "./UserStatusToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ createdAt: -1 });

        const pendingUsers = users.filter((user) => user.accountStatus === 'pending');
        const deletionRequests = users.filter((user) => user.deletionRequested === true);
        const activeUsers = users.filter((user) => user.accountStatus !== 'pending');

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Manage access, approvals and account deletion requests.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-[#fbc037]/20 focus:border-[#fbc037] outline-none transition-all w-48 md:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Deletion Requests ── ALWAYS VISIBLE ── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                            <UserX size={16} />
                            Account Deletion Requests
                        </h3>
                        {deletionRequests.length > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold animate-pulse">
                                {deletionRequests.length} ACTION REQUIRED
                            </span>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                        <div className="p-4 bg-red-50/30 border-b border-red-100 flex items-center gap-3">
                            <AlertTriangle size={14} className="text-red-500" />
                            <p className="text-[11px] font-bold text-red-700 uppercase tracking-tight">
                                Review carefully — approving permanently erases all user data from the system.
                            </p>
                        </div>

                        {deletionRequests.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                                <UserX size={40} className="text-slate-200 mb-3" />
                                <p className="font-semibold text-slate-500">No pending deletion requests</p>
                                <p className="text-xs mt-1">When a user requests deletion, it will appear here.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">User Details</th>
                                            <th className="px-6 py-4">Requested On</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-50">
                                        {deletionRequests.map((user) => (
                                            <tr key={user._id.toString()} className="hover:bg-red-50/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs uppercase">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-none">{user.name}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-900 font-medium">
                                                        {user.deletionRequestedAt
                                                            ? new Date(user.deletionRequestedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : '—'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {user.deletionRequestedAt
                                                            ? new Date(user.deletionRequestedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                                                            : ''}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <form action={async () => {
                                                            'use server';
                                                            await dismissDeletionRequest(user._id.toString());
                                                        }}>
                                                            <SubmitButton className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold text-[11px] hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-none">
                                                                <X size={12} /> Dismiss
                                                            </SubmitButton>
                                                        </form>
                                                        <form action={async () => {
                                                            'use server';
                                                            await approveDeletionRequest(user._id.toString());
                                                        }}>
                                                            <SubmitButton className="h-8 px-3 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-sm">
                                                                <Trash2 size={12} /> Delete Account
                                                            </SubmitButton>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Pending Approvals ── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#fbc037] flex items-center gap-2">
                        <UserCheck size={16} />
                        New Registrations
                        <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded-full font-bold border border-amber-100">
                            {pendingUsers.length} PENDING
                        </span>
                    </h3>

                    {pendingUsers.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
                            <p className="text-slate-400 font-medium text-sm">No pending registration requests.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">User Details</th>
                                            <th className="px-6 py-4">Registered</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingUsers.map((user) => (
                                            <tr key={user._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-none">{user.name}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-slate-900 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Awaiting verification</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <form action={async () => {
                                                            'use server';
                                                            await approveUser(user._id.toString());
                                                        }}>
                                                            <SubmitButton className="h-8 px-3 rounded-lg bg-[#fbc037] text-slate-900 font-bold text-[11px] hover:bg-yellow-400 transition-all flex items-center gap-1.5 shadow-sm">
                                                                <Check size={12} /> Approve
                                                            </SubmitButton>
                                                        </form>
                                                        <form action={async () => {
                                                            'use server';
                                                            await rejectUser(user._id.toString());
                                                        }}>
                                                            <SubmitButton
                                                                className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-red-600 font-bold text-[11px] hover:bg-red-50 transition-all flex items-center gap-1.5 shadow-none"
                                                                spinnerClassName="text-red-600"
                                                            >
                                                                <X size={12} /> Reject
                                                            </SubmitButton>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── User Directory ── */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <UsersIcon size={16} />
                        Active Directory
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1e293b] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeUsers.map((user) => (
                                        <tr key={user._id.toString()} className={`hover:bg-slate-50/50 transition-colors ${user.deletionRequested ? 'bg-red-50/20' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-slate-100 text-slate-500 overflow-hidden flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                                                        {user.profileImage ? (
                                                            <img src={user.profileImage} alt={user.name} className="size-full object-cover" />
                                                        ) : (
                                                            user.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-none flex items-center gap-2">
                                                            {user.name}
                                                            {user.deletionRequested && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded-full uppercase leading-none">
                                                                    <ShieldAlert size={8} /> Deletion
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {user.role === 'admin' && <Shield size={10} />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <UserStatusToggle
                                                    userId={user._id.toString()}
                                                    currentStatus={user.accountStatus}
                                                    currentUserRole={'admin'}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.role !== 'admin' && (
                                                    <form action={async () => {
                                                        'use server';
                                                        await deleteUser(user._id.toString());
                                                    }}>
                                                        <SubmitButton
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors shadow-none bg-transparent"
                                                            spinnerClassName="text-red-500"
                                                        >
                                                            <Trash2 size={16} />
                                                        </SubmitButton>
                                                    </form>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Database connection failed:", error);
        return (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4 text-sm">
                    Could not connect to the database. Please try refreshing the page.
                </p>
            </div>
        );
    }
}
