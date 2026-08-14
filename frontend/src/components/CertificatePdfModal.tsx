import React from 'react';
import { X, Printer, ShieldCheck, Award, Sparkles, CheckCircle2, Globe, QrCode } from 'lucide-react';
import { CertificateRecordUI } from '../services/adminApi';

interface CertificatePdfModalProps {
  certificate: CertificateRecordUI | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePdfModal: React.FC<CertificatePdfModalProps> = ({ certificate, isOpen, onClose }) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-sans my-8">
        {/* Action Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">Official Academic Certificate Document</h3>
              <p className="text-xs text-slate-400">Notarized on Ethereum EVM & pinned to IPFS Gateway</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Certificate Template */}
        <div
          id="certificate-print-area"
          className="bg-slate-950 border-8 border-double border-amber-500/40 rounded-3xl p-8 sm:p-12 relative text-center space-y-8 shadow-2xl print:border-amber-600 print:text-black print:bg-white"
        >
          {/* Background Watermark Pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-sky-400" />
          </div>

          {/* Certificate Header */}
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Academic Credential</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-50 tracking-wide">
              {certificate.program_name}
            </h1>
            <p className="text-xs font-semibold text-slate-400 font-mono">
              Certificate Number: <span className="text-sky-400 font-bold">{certificate.certificate_number}</span>
            </p>
          </div>

          {/* Recipient Statement */}
          <div className="space-y-4 max-w-2xl mx-auto relative z-10">
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">This is to certify that</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-amber-200 py-1">
              STUDENT DEGREES & ACADEMIC CREDENTIAL
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              has successfully fulfilled all academic requirements and demonstrated proficiency to be awarded the degree of{' '}
              <strong className="text-sky-300 font-semibold">{certificate.degree}</strong> with distinction level{' '}
              <strong className="text-amber-300 font-semibold">{certificate.grade}</strong>.
            </p>
          </div>

          {/* Date & Seal */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800 relative z-10 max-w-xl mx-auto">
            <div className="text-left space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Date of Issuance</p>
              <p className="text-xs font-bold text-slate-200">{new Date(certificate.issue_date).toLocaleDateString()}</p>
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Verification Status</p>
              <p className="text-xs font-bold text-emerald-400 flex items-center justify-end space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EVM Notarized</span>
              </p>
            </div>
          </div>

          {/* Proof Cryptographic Footer */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-2 text-[11px] font-mono relative z-10">
            <div className="flex items-center justify-between text-sky-400 font-bold border-b border-slate-800/80 pb-2">
              <span>CRYPTOGRAPHIC PROOF & LEDGER ANCHOR</span>
              <span className="text-[10px] text-slate-500">RFC-8785 Canonical Standard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-[10px]">
              <div>
                <span className="text-slate-500 block">Canonical SHA-256 Hash:</span>
                <span className="text-slate-200 truncate block font-bold">{certificate.canonical_hash}</span>
              </div>

              <div>
                <span className="text-slate-500 block">IPFS Gateway CID:</span>
                <span className="text-indigo-300 truncate block font-bold">{certificate.ipfs_cid || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
