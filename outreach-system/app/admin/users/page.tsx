import dbConnect from "@/lib/db";
import User from "@/models/User";
import { approveUser, rejectUser, deleteUser } from "../actions";
import { Check, X, Shield, Users as UsersIcon, Trash2 } from "lucide-react";
import UserStatusToggle from "./UserStatusToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ createdAt: -1 });

        const pendingUsers = users.filter((user) => user.accountStatus === 'pending');
        const activeUsers = users.filter((user) => user.accountStatus !== 'pending');

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-brand-dark">User Management</h2>
                        <p className="text-slate-500 mt-1">Manage access and permissions for the outreach system.</p>
                    </div>
                    <span className="px-3 py-1 bg-brand-dark text-brand-gold rounded-full text-xs font-bold uppercase tracking-wider">System Administration</span>
                </div>

                {/* Pending Approvals */}
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-brand-dark flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Pending Requests
                        <span className="ml-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-bold">{pendingUsers.length}</span>
                    </h3>

                    {pendingUsers.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center border border-slate-100">
                            <p className="text-slate-400 font-medium">No pending registration requests.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-amber-50/50 text-amber-900/80 border-b border-amber-100">
                                        <tr>
                                            <th className="px-6 py-4 font-bold font-serif">Name</th>
                                            <th className="px-6 py-4 font-bold font-serif">Email</th>
                                            <th className="px-6 py-4 font-bold font-serif">Registered</th>
                                            <th className="px-6 py-4 font-bold font-serif text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingUsers.map((user) => (
                                            <tr key={user._id.toString()} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-brand-dark">{user.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                                <td className="px-6 py-4 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <form action={async () => {
                                                            'use server';
                                                            await approveUser(user._id.toString());
                                                        }}>
                                                            <SubmitButton className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all text-xs font-bold shadow-sm">
                                                                <Check size={14} /> Approve
                                                            </SubmitButton>
                                                        </form>
                                                        <form action={async () => {
                                                            'use server';
                                                            await rejectUser(user._id.toString());
                                                        }}>
                                                            <SubmitButton
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all text-xs font-bold"
                                                                spinnerClassName="text-red-600"
                                                            >
                                                                <X size={14} /> Reject
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

                {/* User Directory */}
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-brand-dark flex items-center gap-2">
                        <UsersIcon size={20} className="text-brand-gold" />
                        Directory
                    </h3>
                    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold font-serif">Name</th>
                                        <th className="px-6 py-4 font-bold font-serif">Email</th>
                                        <th className="px-6 py-4 font-bold font-serif">Role</th>
                                        <th className="px-6 py-4 font-bold font-serif">Status</th>
                                        <th className="px-6 py-4 font-bold font-serif text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeUsers.map((user) => (
                                        <tr key={user._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-brand-dark">{user.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {user.role === 'admin' && <Shield size={12} />}
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <UserStatusToggle
                                                    userId={user._id.toString()}
                                                    currentStatus={user.accountStatus}
                                                    currentUserRole={'admin'} // hardcoded for now as this page is admin only
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.role !== 'admin' && (
                                                    <form action={async () => {
                                                        'use server';
                                                        await deleteUser(user._id.toString());
                                                    }}>
                                                        <SubmitButton
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors shadow-none bg-transparent hover:shadow-none"
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
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-red-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
                <p className="max-w-md mx-auto mb-4">
                    Could not connect to the database. This is usually caused by network issues or an IP address that hasn't been whitelisted in MongoDB Atlas.
                </p>
                <div className="text-xs bg-slate-100 p-4 rounded text-left max-w-lg mx-auto overflow-auto font-mono text-slate-600">
                    {(error as Error).message || "Unknown error"}
                </div>
            </div>
        );
    }
}
