import React, { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, Cpu, Sparkles, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerificationAnimationProps {
  isVerifying: boolean;
  status?: string | null;
  onComplete?: () => void;
}

export const VerificationAnimation: React.FC<VerificationAnimationProps> = ({
  isVerifying,
  status = 'VALID',
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    { label: 'Computing SHA-256 Hash Digest', icon: Cpu },
    { label: 'Querying Ganache EVM Node Ledger', icon: Sparkles },
    { label: 'Fetching IPFS Metadata Pin', icon: ShieldCheck },
    { label: 'Verifying Zero-Knowledge Integrity', icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (!isVerifying) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        if (onComplete) onComplete();
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isVerifying]);

  if (!isVerifying && !status) return null;

  return (
    <AnimatePresence>
      <div className="w-full max-w-xl mx-auto my-6 font-mono-custom">
        {isVerifying ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-glass-card border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-6 text-center relative overflow-hidden"
          >
            {/* Ambient Cyan Pulse Glow */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Node Consensus Engine Active</span>
              </div>
              <h3 className="text-lg font-heading font-bold text-white">
                Matching Hash Against Blockchain Ledger
              </h3>
            </div>

            {/* Animated Chain Nodes Step Sequence */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isPassed = activeStep >= idx;
                const isCurrent = activeStep === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center space-y-2 ${
                      isPassed
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20 scale-105'
                        : 'bg-slate-900/60 border-slate-800 text-slate-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce text-cyan-300' : ''}`} />
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isPassed ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-cyan-300/80 font-mono-custom animate-pulse pt-2">
              {steps[activeStep]?.label}...
            </p>
          </motion.div>
        ) : status === 'VALID' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-950/40 border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4 glow-emerald shadow-2xl relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-heading font-bold uppercase rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Cryptographically Verified</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-white mt-2">
                Authentic Academic Credential
              </h3>
              <p className="text-xs text-emerald-300/90 font-mono-custom mt-1">
                Anchored on Ganache EVM Smart Contract & Pinata IPFS Gateway
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-950/40 border border-rose-500/50 rounded-3xl p-6 text-center space-y-4 glow-rose shadow-2xl relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-rose-500/20 rounded-full border-2 border-rose-400 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/30 animate-pulse">
              <AlertOctagon className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-heading font-bold uppercase rounded-full">
                <XCircle className="w-4 h-4" />
                <span>Tampering or Fabrication Detected</span>
              </div>
              <h3 className="text-xl font-heading font-bold text-white mt-2">
                Unverified / Altered Hash
              </h3>
              <p className="text-xs text-rose-300/90 font-mono-custom mt-1">
                Computed SHA-256 hash digest does not match authentic ledger records
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
