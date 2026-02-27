import React from 'react';
import { BriefcaseMedical, UserPlus, History, ChevronDown, ChevronRight } from 'lucide-react';

export default function PatientEntryDesign() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 text-white p-1.5 rounded-lg flex items-center justify-center">
            <BriefcaseMedical size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">ReachPoint</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Events</a>
          <a href="#" className="text-blue-600 font-semibold">Patients</a>
          <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Records</a>
          <a href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Analytics</a>
        </nav>

        <div className="flex items-center gap-3">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User avatar" 
            className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-8 pb-6">
            {/* Tabs */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-10">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#0F172A] text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-sm transition-all">
                <UserPlus size={16} />
                New Patient
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 text-slate-500 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all">
                <History size={16} className="text-slate-400" />
                Update Record
              </button>
            </div>

            {/* Header Text */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">The new Dawn is here</h1>
              <p className="text-slate-500 text-base">Enter patient data for this outreach event.</p>
            </div>
          </div>

          <div className="px-8 flex flex-col gap-6">
            
            <div className="border-t border-slate-100 -mx-8 mb-2"></div>

            {/* Form Fields */}
            <div className="space-y-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter patient's full legal name"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Age & Sex Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                  <input 
                    type="number" 
                    placeholder="Years"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sex</label>
                  <div className="relative">
                    <select className="w-full h-12 px-4 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                      <option value="" disabled selected>Select Sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PCV & Weight Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PCV (%)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 45"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight (KG)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 72.5"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* HBSAG & HIV Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">HBSAG Status</label>
                  <div className="relative">
                    <select className="w-full h-12 px-4 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                      <option value="" disabled selected>Select Status</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">HIV Status</label>
                  <div className="relative">
                    <select className="w-full h-12 px-4 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                      <option value="" disabled selected>Select Status</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Group & Rhesus Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
                  <div className="relative">
                    <select className="w-full h-12 px-4 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                      <option value="" disabled selected>Select Type</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rhesus Factor</label>
                  <div className="relative">
                    <select className="w-full h-12 px-4 appearance-none rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                      <option value="" disabled selected>Select Factor</option>
                      <option value="positive">Positive (+)</option>
                      <option value="negative">Negative (-)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gmail Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gmail Address <span className="text-blue-500">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="example@gmail.com"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="mt-8 mb-6">
              <button className="w-full h-14 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors">
                Register Patient
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Form Footer */}
            <div className="pb-6 text-center">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">
                ReachPoint Healthcare Outreach Management System
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Page Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-slate-500 font-medium">
          &copy; 2024 ReachPoint. All patient data is encrypted and handled according to medical privacy standards.
        </p>
      </footer>

    </div>
  );
}
