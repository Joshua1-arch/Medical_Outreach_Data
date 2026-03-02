import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-16">
          <p className="text-[#fbc037] text-sm font-bold uppercase tracking-widest mb-4">Technical Manual</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            ReachPoint Documentation
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl border-l-4 border-[#fbc037] pl-4">
            The comprehensive guide for IT administrators, partner hospitals, and developers. Discover the robust architecture, security protocols, and compliance measures that power ReachPoint.
          </p>
        </div>

        {/* Content Layout */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 mb-10 lg:mb-0">
              <div className="sticky top-32">
                <h4 className="text-sm font-bold text-slate-900 tracking-wide mb-4 border-b border-slate-200 pb-2">Table of Contents</h4>
                <nav className="space-y-1">
                  <a href="#intro" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">Introduction</a>
                  <a href="#architecture" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">System Architecture</a>
                  <a href="#offline" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">Offline-First Engine</a>
                  <a href="#security" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">Security & Compliance</a>
                  <a href="#data" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">Data Management</a>
                  <a href="#dr" className="block px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">Disaster Recovery</a>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 prose prose-slate max-w-none">
              
              <section id="intro" className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-slate-200">
                  1. Introduction
                </h2>
                <p className="text-base text-slate-700 leading-relaxed mb-4">
                  ReachPoint is engineered as a resilient, high-performance platform suited for rigorous medical outreach. It eliminates network dependency during data collection while maintaining strict data governance upon synchronization.
                </p>
                <p className="text-base text-slate-700 leading-relaxed">
                  This technical manual details our infrastructure, security principles, and robust architecture built to empower healthcare providers in the most remote areas.
                </p>
              </section>

              <section id="architecture" className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-slate-200">
                  2. System Architecture
                </h2>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Our architecture is built on a modern serverless stack utilizing Next.js, Vercel, and a managed scalable NoSQL database. This ensures 99.9% uptime and auto-scaling to handle sudden surges in concurrent users during large outreach events.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">2.1 Scalability</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">Stateless edge functions allow the application to scale horizontally instantly, accommodating thousands of concurrent data entries without latency spikes. The architecture supports rapid provisioning of resources corresponding to user load.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">2.2 Real-time Synchronization</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">A robust queue system manages data ingestion from remote clients, ensuring reliable synchronization and conflict resolution when devices reconnect to the internet. We employ optimistic UI updates with eventual consistency models to guarantee data integrity.</p>
                  </div>
                </div>
              </section>

              <section id="offline" className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-slate-200">
                  3. Offline-First Engine
                </h2>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Medical outreaches often occur in regions with zero connectivity. ReachPoint explicitly tackles this using Progressive Web App (PWA) technologies combined with localized IndexedDB storage.
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-3 pl-4">
                  <li>
                    <strong>Service Workers:</strong> Caches application assets locally so the application loads instantly, even without cellular service.
                  </li>
                  <li>
                    <strong>Local Encrypted Storage:</strong> Patient data captured offline is stored securely in the browser's IndexedDB, encrypted at the application level prior to disk write operations.
                  </li>
                  <li>
                    <strong>Background Synchronization:</strong> Once connectivity is restored, the sync manager pushes locally stored records to the cloud in batches, with comprehensive error handling and exponential backoff retry logic.
                  </li>
                </ul>
              </section>

              <section id="security" className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-slate-200">
                  4. Security & Compliance
                </h2>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Protecting sensitive health information is our highest priority. The system is designed from the ground up to comply with major data protection regulations including NDPR and HIPAA.
                </p>
                
                <h3 className="text-lg font-bold mb-2">4.1 Regulatory Compliance</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-6">
                  We maintain strict audit logs for every interaction with patient data. Role-Based Access Control (RBAC) guarantees that only authorized medical personnel can view sensitive records. Volunteers receive restricted views, locking down patient identifiers where appropriate to enforce the principle of least privilege.
                </p>
                
                <h3 className="text-lg font-bold mb-4">4.2 Encryption Protocols</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">In Transit</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">All network traffic is secured via TLS 1.3, ensuring data cannot be intercepted or tampered with between the client device and our private servers.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">At Rest</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">Database physical volume storage utilizes AES-256 encryption. Automated backups are additionally encrypted and stored in secure, geo-redundant vaults with strict access protocols.</p>
                  </div>
                </div>
              </section>

              <section id="data" className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-slate-200">
                  5. Data Management & API Integration
                </h2>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  Administrators maintain complete ownership of their data. ReachPoint provides exhaustive export features allowing IT teams to ingest data into custom EHR/EMR systems or analytical tools (SPSS, R, Pandas).
                </p>
                
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-md mb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">5.1 Standardized Export Schema</h4>
                  <pre className="text-xs text-slate-300 bg-slate-900 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono">
{`{
  "eventId": "EVT-8923",
  "exportTimestamp": "2026-03-02T10:00:00Z",
  "patientRecords": [
    {
      "id": "REC-001",
      "demographics": { "age": 42, "gender": "M" },
      "vitals": { "bp": "120/80", "hr": 72 },
      "clinicalNotes": "Patient presented with mild hypertension..."
    }
  ]
}`}
                  </pre>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  By adhering to standardized JSON shapes, ReachPoint acts as a smooth transition layer from field data collection to long-term hospital records or specialized research databases.
                </p>
              </section>

              <section id="dr" className="mb-16 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-slate-200">
                  6. Disaster Recovery
                </h2>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  To ensure constant availability and zero data loss, our infrastructure includes automated daily point-in-time backups. In the event of catastrophic failure, data can be restored with a defined Recovery Point Objective (RPO) of 5 minutes and a Recovery Time Objective (RTO) of less than 1 hour.
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                  <li>Geo-redundant database replication continuously syncing across multiple availability zones.</li>
                  <li>Automated failover routing via global edge networks ensuring high availability.</li>
                  <li>Continuous health checks and proactive anomaly detection algorithms monitoring cluster status.</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-8 mt-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-3">
               <span className="text-xl font-bold tracking-tight text-slate-900">ReachPoint</span>
             </div>
             <div className="flex gap-6">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Platform Home</Link>
                <Link href="/help" className="text-sm font-medium text-slate-600 hover:text-slate-900">Help Center</Link>
             </div>
          </div>
          <div className="mt-8 text-center md:text-left flex justify-between">
            <p className="text-xs text-slate-500">
               © {new Date().getFullYear()} ReachPoint, Inc. Confidentially prepared for authorized users.
            </p>
            <p className="text-xs text-slate-400">
               Version 2.4.1 (Last Updated: March 2026)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
