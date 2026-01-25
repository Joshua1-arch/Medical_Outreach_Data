import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { User as UserIcon, Calendar, Activity, AlertCircle, Trash2, Edit, CheckCircle } from 'lucide-react';
import User from "@/models/User"; // Ensure populated model is registered

export default async function AuditLogFeed() {
    await dbConnect();

    // Ensure User model is loaded for population
    const _ = User;

    const logs = await AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'name email');

    const getIcon = (action: string) => {
        if (action.includes('USER')) return <UserIcon size={16} className="text-blue-500" />;
        if (action.includes('EVENT')) return <Calendar size={16} className="text-purple-500" />;
        if (action.includes('DELETE')) return <Trash2 size={16} className="text-red-500" />;
        if (action.includes('APPROVE')) return <CheckCircle size={16} className="text-green-500" />;
        return <Activity size={16} className="text-slate-500" />;
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg">System Activity Log</h3>
                <span className="text-xs text-slate-400 font-medium">Last 10 Actions</span>
            </div>
            <div className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No activity recorded yet.</div>
                ) : (
                    logs.map((log: any) => (
                        <div key={log._id.toString()} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                {getIcon(log.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-bold text-slate-700 truncate">
                                        {formatActionName(log.action)}
                                    </p>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">
                                    Performed by <span className="font-semibold text-slate-700">{log.performedBy?.name || 'Unknown User'}</span>
                                </p>
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <details className="mt-2 text-xs text-slate-400 cursor-pointer group">
                                        <summary className="group-hover:text-brand-dark transition-colors list-none flex items-center gap-1">
                                            View Details
                                        </summary>
                                        <pre className="mt-1 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto text-[10px]">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function formatActionName(action: string) {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
