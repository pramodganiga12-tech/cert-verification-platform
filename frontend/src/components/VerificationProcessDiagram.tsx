import React, { useState } from 'react';
import { GraduationCap, Building2, Hash, ShieldCheck, QrCode, UploadCloud, Cpu, CheckCircle2, XCircle, ArrowRight, Sparkles, Layers, FileText, Search, ShieldAlert, Award } from 'lucide-react';

export const VerificationProcessDiagram: React.FC = () => {
  const [activePart, setActivePart] = useState<'ALL' | 'ISSUANCE' | 'VERIFICATION'>('ALL');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans">
      {/* Title & Methodology Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Methodology & Architecture</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-50 tracking-tight">Academic Certificate Verification System</h2>
            <p className="text-xs text-slate-400 mt-1">
              Shree Devi Institute of Technology • Dual-Phase Cryptographic Issuance & Verification Lifecycle
            </p>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs shrink-0">
            <button
              onClick={() => setActivePart('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activePart === 'ALL' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Lifecycle
            </button>
            <button
              onClick={() => setActivePart('ISSUANCE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activePart === 'ISSUANCE' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phase 1: Issuance
            </button>
            <button
              onClick={() => setActivePart('VERIFICATION')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activePart === 'VERIFICATION' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phase 2: Verification
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHASE 1: MASS CERTIFICATE ISSUANCE FLOW                  */}
        {/* ======================================================== */}
        {(activePart === 'ALL' || activePart === 'ISSUANCE') && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Phase 1: Mass Certificate Issuance &amp; Blockchain Anchoring Process</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
              
              {/* Step 1 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-sky-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold block">1. DROP BATCH</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Admin / Issuer drop PDF batch</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Uploads multiple certificate PDFs or ZIP package</p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-indigo-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold block">2. PARSE TEXT</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Parse Text Buffer (pdf-parse)</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Extracts text and inspects document structure</p>
              </div>

              {/* Step 3 & 4 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-teal-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-teal-400 font-bold block">3 &amp; 4. VALIDITY</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Check Document Validity</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Rejects invalid files; approves standard documents</p>
              </div>

              {/* Step 5 & 6 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">5 &amp; 6. HASH &amp; IPFS</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Compute SHA-256 &amp; IPFS CID</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Digital fingerprint &amp; decentralized file storage</p>
              </div>

              {/* Step 7, 8 & 9 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-amber-500/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block">7, 8 &amp; 9. GANACHE</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Stamp QR &amp; Anchor Blockchain</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Registers DocID + SHA256 + CID on Ganache</p>
              </div>

            </div>
          </div>
        )}

        {/* Divider if showing both */}
        {activePart === 'ALL' && <div className="border-t border-slate-800 my-6" />}

        {/* ======================================================== */}
        {/* PHASE 2: VERIFICATION & AUDIT FLOW (10-STEP PIPELINE)    */}
        {/* ======================================================== */}
        {(activePart === 'ALL' || activePart === 'VERIFICATION') && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Phase 2: Verification &amp; Audit Flow (10-Step Pipeline)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* Step 1 & 2 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-sky-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold block">1 &amp; 2. UPLOAD / PARSE</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Upload PDF or Scan QR</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Parses text buffer using pdf-parse</p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-indigo-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold block">3. RECALCULATE HASH</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Recalculate SHA-256 Hash</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Generates current document fingerprint</p>
              </div>

              {/* Step 4 & 5 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-purple-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold block">4 &amp; 5. QUERY &amp; COMPARE</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Query Ganache &amp; Check Match</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Compares scanned hash vs. stored hash</p>
              </div>

              {/* Step 6 & 7 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-emerald-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">6 &amp; 7. VERDICT</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Mark Genuine / Fabrication</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">✔ Match: Genuine | ✖ No Match: Modified</p>
              </div>

              {/* Step 8, 9 & 10 */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 relative group hover:border-amber-500/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block">8, 9 &amp; 10. AUDIT &amp; END</span>
                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">Display Result &amp; Audit Log</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Generates audit trail &amp; completes flow</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
