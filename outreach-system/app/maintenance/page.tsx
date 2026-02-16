
import { TriangleAlert } from "lucide-react";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="animate-pulse">
                <TriangleAlert size={80} className="text-amber-500 mb-6 mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Under Maintenance</h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                We are currently performing scheduled upgrades to improve our system.
                Please check back in a few minutes.
            </p>
            <div className="mt-12 text-sm text-slate-600">
                &copy; {new Date().getFullYear()} ReachPoint System
            </div>
        </div>
    );
}
