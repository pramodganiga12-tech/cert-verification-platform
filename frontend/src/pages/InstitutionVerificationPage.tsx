import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { VerificationInputCard } from '../components/VerificationInputCard';
import { VerificationResultCard } from '../components/VerificationResultCard';
import { AuditTrailAccordion } from '../components/AuditTrailAccordion';
import { VerificationProcessDiagram } from '../components/VerificationProcessDiagram';
import { VerificationReport } from '../types/verification';
import { ShieldCheck, AlertCircle, X, CheckCircle2, Search } from 'lucide-react';

export const InstitutionVerificationPage: React.FC = () => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStart = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setReport(null);
  };

  const handleComplete = (rep: VerificationReport) => {
    setReport(rep);
    setIsLoading(false);
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setIsLoading(false);
  };

  const handleReset = () => {
    setReport(null);
    setErrorMsg(null);
    setIsLoading(false);
  };

  return (
    <DashboardLayout activeTab="verify">
      <div className="space-y-8 max-w-7xl mx-auto font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Institution Issuer Verification Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">Institutional Certificate Verification</h1>
            <p className="text-xs text-slate-400">
              Shree Devi Institute of Technology • Upload PDF, Scan QR, or Input SHA-256 Hash to verify against Blockchain Ledger.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="w-full max-w-4xl mx-auto p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-300 text-sm animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-rose-500/20 rounded-lg text-rose-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Verification Input Card or Result */}
        {!report ? (
          <div className="space-y-12">
            <VerificationInputCard
              onVerificationStart={handleStart}
              onVerificationComplete={handleComplete}
              onError={handleError}
              isLoading={isLoading}
            />

            {/* 2-Part Methodology Flow Diagram */}
            <VerificationProcessDiagram />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <VerificationResultCard report={report} onReset={handleReset} />
            <AuditTrailAccordion steps={report.steps} />

            <VerificationProcessDiagram />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
