import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { VerificationInputCard } from '../components/VerificationInputCard';
import { VerificationResultCard } from '../components/VerificationResultCard';
import { AuditTrailAccordion } from '../components/AuditTrailAccordion';
import { VerificationProcessDiagram } from '../components/VerificationProcessDiagram';
import { Footer } from '../components/Footer';
import { VerificationReport } from '../types/verification';
import { VerificationApiService } from '../services/api';
import { AlertCircle, X } from 'lucide-react';

export const PublicVerificationPage: React.FC = () => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Detect ?hash= or ?id= query param from URL (e.g. from scanned QR code)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParam = urlParams.get('hash');
    const idParam = urlParams.get('id');

    if (hashParam) {
      setIsLoading(true);
      VerificationApiService.verifyByHash(hashParam)
        .then((rep) => {
          setReport(rep);
          setIsLoading(false);
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to verify hash from URL');
          setIsLoading(false);
        });
    } else if (idParam) {
      setIsLoading(true);
      VerificationApiService.verifyById(idParam)
        .then((rep) => {
          setReport(rep);
          setIsLoading(false);
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to verify certificate ID from URL');
          setIsLoading(false);
        });
    }
  }, []);

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
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
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

        {/* Search Input Card or Results */}
        {!report ? (
          <div className="space-y-12">
            <VerificationInputCard
              onVerificationStart={handleStart}
              onVerificationComplete={handleComplete}
              onError={handleError}
              isLoading={isLoading}
            />

            {/* 2-Part Methodology Diagram (Issuance & Verification Flow) */}
            <VerificationProcessDiagram />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <VerificationResultCard report={report} onReset={handleReset} />
            <AuditTrailAccordion steps={report.steps} />
            
            {/* 2-Part Methodology Diagram below result */}
            <VerificationProcessDiagram />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
