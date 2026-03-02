import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ApiStatusPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
          <p className="text-[#fbc037] text-sm font-bold uppercase tracking-widest mb-4">System Status</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
                All Systems Operational
              </h1>
              <p className="text-lg text-slate-600">
                Current status of ReachPoint infrastructure and active services.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-md border border-emerald-100">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 font-bold text-sm">Updated just now</span>
            </div>
          </div>
        </div>

        {/* Core Services Grid */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Core Services</h2>
          <div className="space-y-4">
            {/* Service 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">API Endpoints</h3>
                <p className="text-sm text-slate-500">Handling data ingestion and export requests.</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                Operational
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Database & Storage</h3>
                <p className="text-sm text-slate-500">Primary patient records and file storage integrity.</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                Operational
              </div>
            </div>

            {/* Service 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Data Synchronization Engine</h3>
                <p className="text-sm text-slate-500">Processing background syncs from offline field devices.</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                Operational
              </div>
            </div>

            {/* Service 4 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Authentication Services</h3>
                <p className="text-sm text-slate-500">User login, session management, and RBAC active checks.</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                Operational
              </div>
            </div>
            
            {/* Service 5 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Analytics Dashboard</h3>
                <p className="text-sm text-slate-500">Real-time processing and chart generation.</p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                Operational
              </div>
            </div>
          </div>
        </div>

        {/* Uptime Metrics Track */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Historical Uptime (Past 90 days)</h2>
          <div className="bg-slate-50 p-6 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-700">99.99% Global Uptime</span>
              <span className="text-xs text-slate-500">0 downtime events</span>
            </div>
            
            {/* 90-day simulated timeline (visual representation) */}
            <div className="flex w-full h-8 gap-0.5 md:gap-1">
              {Array.from({ length: 90 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-sm bg-emerald-400 opacity-80 hover:opacity-100 transition-opacity" title="Operational"></div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-3 text-xs text-slate-500 font-medium tracking-wide">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Past Incidents log */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Past Incidents</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p className="ml-1 border-l-4 border-slate-200 pl-4 py-1 text-sm">
              No incidents reported in the past 30 days. All systems are operating smoothly.
            </p>
          </div>
        </div>
        
      </main>

      {/* Corporate Minimal Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-8 mt-auto">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-3">
               <span className="text-xl font-bold tracking-tight text-slate-900">ReachPoint</span>
             </div>
             <div className="flex gap-6">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Platform Home</Link>
                <Link href="/help" className="text-sm font-medium text-slate-600 hover:text-slate-900">Help Center</Link>
             </div>
          </div>
          <div className="mt-8 text-center md:text-left flex justify-between items-center">
            <p className="text-xs text-slate-500">
               © {new Date().getFullYear()} ReachPoint, Inc. Systems operationally monitored 24/7.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
