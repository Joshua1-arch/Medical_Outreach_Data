import Navbar from "@/components/Navbar";
import Link from "next/link";
import { getSiteConfig } from "@/app/admin/settings/actions";

export default async function CaseStudiesPage() {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-20 text-center">
          <p className="text-sm font-bold tracking-widest text-[#fbc037] uppercase mb-4">
            ReachPoint in Action
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
            Proven impact in the field
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            See how medical teams are using our platform to streamline field clinics and focus on what matters most: the patients.
          </p>
        </div>

        {/* Case Studies Container */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Case Study 1 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative overflow-hidden rounded-2xl shadow-xl border border-slate-200 aspect-[4/3]">
              {config?.images?.caseStudy1 && (
                <img 
                  src={config.images.caseStudy1} 
                  alt="Community health workers processing patients" 
                  className="object-cover w-full h-full" 
                />
              )}
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                The Ogbomoso Community Health Drive
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The Challenge</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    A local outreach team needed to screen over 500 residents for hypertension, malaria, and trace element deficiencies in a single weekend. Paper forms were causing massive bottlenecks at the registration desk.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The ReachPoint Solution</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    The organizers deployed ReachPoint's mobile-friendly forms. 15 volunteers collected data simultaneously on their smartphones.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The Result</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Patient processing time was cut in half. The Live Chat allowed the admin to perfectly balance the flow of patients between the screening desks and the laboratory stations, resulting in zero lost data and a perfectly organized CSV export for their post-event research.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Case Study 2 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                Regional Blood Drive Logistics
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The Challenge</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    A regional blood bank struggled to track donor demographics and blood group distributions in real-time during multi-city drives.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The ReachPoint Solution</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Using the automated Analytics Dashboard, the blood bank directors monitored the incoming data live.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The Result</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    By watching the live charts, the directors could see exactly when they had collected enough O-Negative blood, allowing them to reallocate resources instantly. The post-event AI report was generated in seconds and handed directly to the hospital board.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-200 aspect-[4/3]">
              {config?.images?.caseStudy2 && (
                <img 
                  src={config.images.caseStudy2} 
                  alt="Blood drive logistics" 
                  className="object-cover w-full h-full" 
                />
              )}
            </div>
          </section>

          {/* Case Study 3 */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative overflow-hidden rounded-2xl shadow-xl border border-slate-200 aspect-[4/3]">
              {config?.images?.caseStudy3 && (
                <img 
                  src={config.images.caseStudy3} 
                  alt="Remote medical logistics" 
                  className="object-cover w-full h-full" 
                />
              )}
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                Remote Island Vaccination Drive
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The Challenge</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    An international NGO had 48 hours to administer pediatric vaccines across a disconnected archipelago. There was zero cellular coverage, and they needed strictly compliant, offline-capable digital logs to satisfy their funding auditors.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The ReachPoint Solution</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Volunteers initialized ReachPoint as an offline Progressive Web App (PWA) before departing the mainland. They utilized the synchronized inventory tracker offline to reliably manage their stock limits between islands.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1 border-b border-slate-100 pb-1">The Result</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    All 1,200 patient records and inventory deductions were stored locally using fully encrypted IndexedDB. Upon returning to the mainland clinic, the sync engine successfully uploaded the records without a single duplicate or synchronization error, satisfying all regulatory requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
        
        {/* Call to action */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-32 text-center border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4 font-serif">
            Ready to optimize your next mission?
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Learn how the platform can be adapted to fit your unique clinical workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="h-12 px-8 rounded-lg bg-[#fbc037] text-slate-900 font-bold hover:bg-[#fbc037]/90 transition-all shadow-sm flex items-center justify-center"
            >
              Get Started for Free
            </Link>
            <Link
              href="/documentation"
              className="h-12 px-8 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-[#fbc037] transition-all flex items-center justify-center"
            >
              Read the Technical Manual
            </Link>
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
               © {new Date().getFullYear()} ReachPoint, Inc.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
