import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle, ChevronDown, ChevronUp, Cpu, ListChecks } from 'lucide-react';
import { VerificationStep, VerificationStepStatus } from '../types/verification';

interface AuditTrailAccordionProps {
  steps: VerificationStep[];
}

export const AuditTrailAccordion: React.FC<AuditTrailAccordionProps> = ({ steps }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const getStepIcon = (status: VerificationStepStatus) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'SKIPPED':
      default:
        return <MinusCircle className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const getStepBadgeStyle = (status: VerificationStepStatus) => {
    switch (status) {
      case 'PASSED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'SKIPPED':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const passedCount = steps.filter((s) => s.status === 'PASSED').length;
  const failedCount = steps.filter((s) => s.status === 'FAILED').length;
  const warningCount = steps.filter((s) => s.status === 'WARNING').length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-2xl transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <ListChecks className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Cryptographic Audit & Diagnostic Pipeline</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700 font-normal">
                {steps.length} Executed Steps
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              12-Step Reasoning Engine Audit Breakdown ({passedCount} Passed • {failedCount} Failed • {warningCount} Warnings)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl transition-all hover:border-slate-700/80 gap-4"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getStepIcon(step.status)}</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200 font-mono">{step.stepName}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{step.description}</p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${getStepBadgeStyle(step.status)}`}>
                  {step.status}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
