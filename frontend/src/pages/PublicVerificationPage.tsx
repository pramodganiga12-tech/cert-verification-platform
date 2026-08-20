import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { VerificationInputCard } from '../components/VerificationInputCard';
import { VerificationResultCard } from '../components/VerificationResultCard';
import { AuditTrailAccordion } from '../components/AuditTrailAccordion';
import { VerificationProcessDiagram } from '../components/VerificationProcessDiagram';
import { Footer } from '../components/Footer';
import { VerificationReport } from '../types/verification';
import { VerificationApiService } from '../services/api';
import { ShieldCheck, Award, Lock, ArrowRight, Activity, CheckCircle2, AlertCircle, X, Sparkles, FileSearch, Building, Cpu, Layers } from 'lucide-react';
import { BlockchainScene3D } from '../components/3d/BlockchainScene3D';
import { CertificateCard3D } from '../components/3d/CertificateCard3D';
import { VerificationAnimation } from '../components/3d/VerificationAnimation';

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

  const scrollToVerify = () => {
    const el = document.getElementById('verification-hub');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* 3D WebGL Rotating Blockchain Canvas */}
      <BlockchainScene3D />

      {/* Top Ticker Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-violet-600 text-white text-[11px] font-heading font-bold uppercase tracking-wider py-1.5 px-4 text-center overflow-hidden whitespace-nowrap z-50 shadow-lg">
        <span>Shree Devi Institute of Technology • VTU & AICTE Approved • Department of Computer Science & Engineering (2026-2027) • Blockchain Certificate Platform</span>
      </div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 relative z-10">
        {/* Error Alert */}
        {errorMsg && (
          <div className="w-full max-w-4xl mx-auto p-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono-custom flex items-center justify-between rounded-2xl backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-rose-500/20 text-rose-400 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono-custom font-bold uppercase rounded-full tracking-wider shadow-lg shadow-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Zero-Knowledge Integrity Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight">
              Blockchain-Based Academic<br />
              <span className="text-gradient-cyan">Certificate Platform</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-sans max-w-2xl leading-relaxed">
              Instantly verify degree certificates, transcripts, and credentials issued by <strong className="text-white">Shree Devi Institute of Technology</strong>.
              Cryptographically anchored on <span className="text-cyan-400 font-semibold">Ganache EVM Smart Contracts</span> with <span className="text-violet-400 font-semibold">IPFS Decentralized Storage</span>.
            </p>

            {/* Hero Action CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={scrollToVerify}
                className="btn-futuristic px-6 py-3.5 rounded-2xl text-xs flex items-center space-x-2 cursor-pointer"
              >
                <FileSearch className="w-4 h-4" />
                <span>Verify a Certificate</span>
              </button>

              <a
                href="/login"
                className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-heading font-bold text-xs rounded-2xl border border-slate-700 transition-all uppercase tracking-wider flex items-center space-x-2"
              >
                <Lock className="w-4 h-4 text-violet-400" />
                <span>Issue a Certificate</span>
              </a>
            </div>

            {/* 4-Grid Key Metrics Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-heading text-white">300+</div>
                <div className="text-xs font-mono-custom text-slate-400">Issued Credentials</div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-emerald-400">100%</div>
                <div className="text-xs font-mono-custom text-slate-400">EVM Immutable</div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-cyan-400">0.04s</div>
                <div className="text-xs font-mono-custom text-slate-400">Instant Verification</div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="text-2xl sm:text-3xl font-bold font-heading text-violet-400">99.9%</div>
                <div className="text-xs font-mono-custom text-slate-400">Zero Fabrication</div>
              </div>
            </div>
          </div>

          {/* Interactive 3D Certificate Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <CertificateCard3D isScanning={isLoading} />
          </div>
        </div>

        {/* Verification Animation Payoff Header */}
        <VerificationAnimation isVerifying={isLoading} status={report ? report.finalStatus : null} />

        {/* Search Input Card or Results */}
        <div id="verification-hub" className="scroll-mt-24">
          {!report ? (
            <div className="space-y-14">
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
            <div className="space-y-10">
              <VerificationResultCard report={report} onReset={handleReset} />
              <AuditTrailAccordion steps={report.steps} />
              
              {/* 2-Part Methodology Diagram below result */}
              <VerificationProcessDiagram />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
