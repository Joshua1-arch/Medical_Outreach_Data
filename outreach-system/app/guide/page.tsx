import Link from 'next/link';
import Image from 'next/image';

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <header className="flex h-16 items-center justify-between px-6 md:px-10 border-b border-slate-100 sticky top-0 bg-white z-30 overflow-hidden">
                <Link href="/" className="flex items-center gap-2 shrink-0 pr-4">
                    <Image src="/Reach.png" alt="ReachPoint Logo" width={28} height={28} className="object-contain" />
                    <span className="text-xl font-bold tracking-tight">ReachPoint</span>
                </Link>
                <nav className="flex items-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide shrink-0 pb-1">
                    <Link href="/help" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Back to Help Center
                    </Link>
                </nav>
            </header>

            <main className="max-w-3xl mx-auto py-16 px-6 md:px-10">
                <Link href="/help" className="inline-block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-12">
                    &larr; Back to Help Center
                </Link>

                <article>
                    <div className="space-y-6 mb-16 pb-12 border-b border-slate-100">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-slate-900">
                            Welcome to ReachPoint: Your Field Guide to Better Outreaches
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed md:text-xl">
                            Organizing a medical outreach is chaotic. Between managing volunteers, tracking supplies, and attending to patients, the last thing you need is software slowing you down.
                        </p>
                        <p className="text-lg text-slate-500 leading-relaxed md:text-xl">
                            ReachPoint was built to take that friction away. Whether you are running a local blood drive or coordinating a massive community health event, this guide will show you how to set up your command center and keep your field team completely in sync.
                        </p>
                    </div>

                    <div className="space-y-16">
                        {/* Phase 1 */}
                        <section id="phase-1">
                            <h2 className="text-2xl font-bold mb-4">Phase 1: Setting Up Basecamp (For Event Admins)</h2>
                            <p className="text-slate-600 mb-8 text-lg">Before your team arrives, you need to set up your digital workspace.</p>
                            
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">1. Get Your Access</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Head to the registration page and apply for access. Enter your details securely. If you have a VIP invitation code, drop it in to instantly unlock your admin dashboard. Otherwise, hang tight for quick system approval. Once you are in, the dashboard becomes your central hub for overseeing every active campaign.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">2. Launch a New Event</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Hit Create Event on your dashboard. Give it a clear Title, Date, and Location, plus a quick rundown of the mission. Click generate. Just like that, your digital event space is live and ready for customization.</p>
                                </div>
                            </div>
                        </section>

                        {/* Phase 2 */}
                        <section id="phase-2">
                            <h2 className="text-2xl font-bold mb-4">Phase 2: Equipping Your Team</h2>
                            <p className="text-slate-600 mb-8 text-lg">Every outreach is different. Your volunteers need a form that captures exactly what you are screening for—nothing more, nothing less.</p>
                            
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">1. The Form Builder</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Open your new event and jump into the Form Builder. It is completely drag-and-drop. Need to track Blood Pressure, Weight, or Blood Group? Just click to add them to the page. You can easily throw in custom questions, like simple Yes/No dropdowns for patient history or dietary habits.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">2. Lock It In</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Once the flow feels right, hit Save. The form instantly updates and is locked in for your field team to use.</p>
                                </div>
                            </div>
                        </section>

                        {/* Phase 3 */}
                        <section id="phase-3">
                            <h2 className="text-2xl font-bold mb-4">Phase 3: Boots on the Ground (For Volunteers)</h2>
                            <p className="text-slate-600 mb-8 text-lg">Out in the field, speed is everything. We built this phase so your volunteers can focus entirely on the patients in front of them, without downloading apps or remembering passwords.</p>
                            
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">1. Deploy the Link</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Copy the Public Event Link from your admin dashboard. Blast it out to your team via WhatsApp or text message. That is it. They just click the link and the form opens instantly on their phones.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">2. Zero-Friction Data Entry</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Volunteers simply type in the patient's vitals and hit Submit. ReachPoint has their back: if someone enters a critical blood pressure reading (like 180/120), the screen immediately flashes a warning so the volunteer knows to escalate the case to a doctor. If the network drops completely during a rural outreach, the system seamlessly saves the data directly to the device and silently syncs it up to the cloud the second the connection returns.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">3. The Command Center Chat</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Things change fast in the field. Volunteers have a floating chat widget right on their data entry screen. They can instantly message the Event Admin to request more syringes or ask for a second opinion, without ever losing their place on the patient's form.</p>
                                </div>
                            </div>
                        </section>

                        {/* Phase 4 */}
                        <section id="phase-4">
                            <h2 className="text-2xl font-bold mb-4">Phase 4: Making Sense of the Data</h2>
                            <p className="text-slate-600 mb-8 text-lg">When the dust settles, the real work begins: turning all those patient interactions into actionable medical insights.</p>
                            
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">1. Visualizing the Impact</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Open the Analytics tab on your dashboard. ReachPoint does the heavy lifting, instantly generating charts that break down demographics, leading blood groups, and overall community health trends.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">2. The AI Chief Medical Officer</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Click Analyze with AI to get an instant executive summary. The system reviews the entire dataset, identifies clinical risk vectors, and writes a professional report you can hand straight to your stakeholders.</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">3. Export for Deep Dives</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">Need to run deeper statistical analysis in SPSS, Excel, or Python? Hit Export Event Data in your settings to instantly download a perfectly clean CSV of every single patient record.</p>
                                </div>
                            </div>
                        </section>

                        {/* Quick Recap */}
                        <section className="border-t border-slate-100 pt-12 mt-12">
                            <h2 className="text-2xl font-bold mb-6 text-slate-900">
                                The Quick Recap
                            </h2>
                            <ul className="list-disc pl-5 space-y-3 text-lg text-slate-700">
                                <li><strong>Admins</strong> build custom, no-code forms from the dashboard.</li>
                                <li><strong>Volunteers</strong> collect data via a simple web link that works offline.</li>
                                <li>The system flags critical health warnings in real-time.</li>
                                <li>Teams stay synced through the live command center chat.</li>
                                <li>Data is instantly visualized, analyzed by AI, and ready for export.</li>
                            </ul>
                        </section>

                    </div>
                </article>
            </main>
            
            {/* ── Footer ── */}
            <footer className="border-t border-slate-100 py-12 px-6 md:px-10 mt-12 bg-white">
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <Image src="/Reach.png" alt="ReachPoint Logo" width={18} height={18} className="object-contain grayscale opacity-50" />
                        <span className="text-sm font-bold text-slate-400">ReachPoint</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-400">© 2026 ReachPoint. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
