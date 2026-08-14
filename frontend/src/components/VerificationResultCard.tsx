import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, XCircle, AlertTriangle, HelpCircle, Copy, Check, ExternalLink, RefreshCw, Calendar, User, GraduationCap, Building2, Cpu, Globe, QrCode, FileCheck, Key } from 'lucide-react';
import { VerificationReport, FinalVerificationStatus } from '../types/verification';

interface VerificationResultCardProps {
  report: VerificationReport;
  onReset: () => void;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({ report, onReset }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showHashPromptModal, setShowHashPromptModal] = useState<boolean>(false);
  const [promptHashInput, setPromptHashInput] = useState<string>('');
  const [hashPromptError, setHashPromptError] = useState<string | null>(null);

  const copyToClipboard = (textToCopy?: string) => {
    const text = textToCopy || `Certificate Verification Report:
Status: ${report.finalStatus}
Authentic: ${report.isAuthentic ? 'YES' : 'NO'}
Certificate Number: ${report.certificateNumber || 'N/A'}
Student: ${report.studentDetails?.studentName || 'N/A'} (${report.studentDetails?.studentId || 'N/A'})
Institution: ${report.issuerDetails?.institutionName || 'N/A'}
Canonical SHA-256 Hash: ${report.canonicalHash || 'N/A'}
Verified At: ${report.verifiedAt}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: FinalVerificationStatus) => {
    switch (status) {
      case 'VALID':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          gradient: 'from-emerald-600 to-teal-700',
          icon: ShieldCheck,
          label: 'AUTHENTIC & VERIFIED ACADEMIC CERTIFICATE',
          sub: 'Cryptographically notarized on IPFS and EVM Blockchain'
        };
      case 'REVOKED':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          gradient: 'from-rose-600 to-red-700',
          icon: XCircle,
          label: 'REVOKED BY ISSUER',
          sub: report.revocationDetails?.reason ? `Reason: "${report.revocationDetails.reason}"` : 'Official administrative revocation'
        };
      case 'INVALID_HASH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          gradient: 'from-amber-600 to-orange-700',
          icon: AlertOctagon,
          label: 'TAMPERING DETECTED / UNRECOGNIZED PDF',
          sub: 'Computed SHA-256 hash does not match any authentic platform database record'
        };
      case 'EXPIRED':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          gradient: 'from-orange-600 to-amber-700',
          icon: AlertTriangle,
          label: 'CERTIFICATE EXPIRED',
          sub: 'The validity period for this credential has elapsed'
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          gradient: 'from-purple-600 to-indigo-700',
          icon: AlertTriangle,
          label: 'SUSPICIOUS METADATA',
          sub: 'IPFS content hash does not match stored blockchain ledger hash'
        };
      case 'NOT_FOUND':
      default:
        return {
          bg: 'bg-slate-800/80 border-slate-700 text-slate-400',
          gradient: 'from-slate-700 to-slate-800',
          icon: HelpCircle,
          label: 'RECORD NOT FOUND / UNRECOGNIZED FILE',
          sub: 'No academic certificate matching this uploaded PDF file or SHA-256 hash exists'
        };
    }
  };

  const statusConfig = getStatusBadge(report.finalStatus);
  const StatusIcon = statusConfig.icon;

  const verificationUrl = report.canonicalHash ? `http://localhost:3000/?hash=${report.canonicalHash}` : '';
  const qrCodeDataUrl = report.canonicalHash
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verificationUrl)}&color=38bdf8&bgcolor=0f172a`
    : '';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
      {/* Banner Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${statusConfig.gradient} text-white shadow-xl`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div>
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}>
                <span>{statusConfig.label}</span>
              </div>
              <p className="text-slate-300 text-sm mt-1.5">{report.explanation}</p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Verify Another File</span>
          </button>
        </div>

        {/* PDF Analysis & Blockchain Hash Comparison Section (Pages 6, 10 & 14 of PDF Presentation) */}
        <div className="mt-6 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">PDF Certificate & Hash Analysis</p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Computed SHA-256 Hash:{' '}
                  <span className="text-sky-300 font-bold">{report.canonicalHash ? `${report.canonicalHash.slice(0, 24)}...` : 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
                  report.isAuthentic
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {report.isAuthentic ? '✔ MATCH: Genuine & Authenticated' : '✖ NO MATCH: Fabrication Detected'}
              </span>

              <button
                onClick={() => setShowHashPromptModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-1.5 shrink-0 transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Scan QR / Prompt Hash</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-slate-900">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">SCANNED HASH (GENERATED)</span>
              <span className="text-sky-300 font-bold break-all">{report.canonicalHash || 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">STORED BLOCKCHAIN HASH</span>
              <span className="text-emerald-400 font-bold break-all">
                {report.isAuthentic ? report.canonicalHash : 'RECORD_NOT_FOUND_OR_ALTERED'}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Student Info */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-3">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
              <User className="w-4 h-4" />
              <span>Student Profile</span>
            </div>
            {report.studentDetails ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-100">{report.studentDetails.studentName}</p>
                <p className="text-xs text-slate-400 font-mono">
                  Roll / Student ID: <span className="text-sky-300">{report.studentDetails.studentId}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No student registry details found for this hash</p>
            )}
          </div>

          {/* Institution Info */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Issuing Institution</span>
            </div>
            {report.issuerDetails ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-100">{report.issuerDetails.institutionName}</p>
                <p className="text-xs text-slate-400 font-mono">
                  Institution Code: <span className="text-indigo-300">{report.issuerDetails.institutionCode}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No verified institution details found</p>
            )}
          </div>

          {/* Credential Details */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Academic Credential Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Certificate Number</span>
                <p className="text-sm font-semibold text-slate-200 font-mono">{report.certificateNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Verification ID</span>
                <p className="text-xs font-mono text-slate-400 truncate">{report.verificationId}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Verification Timestamp</span>
                <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(report.verifiedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Ledger & Dynamic Generated QR Code Section */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Cryptographic Proof & Decentralized Storage</span>
            </h4>

            {/* Canonical Hash */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 gap-2">
              <div className="truncate">
                <span className="text-slate-500 mr-2">SHA-256:</span>
                <span className="text-sky-300 font-semibold truncate">{report.canonicalHash || 'N/A'}</span>
              </div>
              <button
                onClick={() => copyToClipboard(report.canonicalHash || '')}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] rounded-lg border border-slate-700 shrink-0 transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            {/* IPFS CID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 gap-2">
              <div className="truncate">
                <span className="text-slate-500 mr-2">IPFS CID:</span>
                <span className="text-indigo-300 font-semibold truncate">{report.ipfsCid || 'Not pinned to IPFS'}</span>
              </div>
              {report.ipfsCid && (
                <span className="inline-flex items-center space-x-1 text-sky-400 hover:underline text-[11px] shrink-0">
                  <Globe className="w-3 h-3" />
                  <span>IPFS Storage Gateway</span>
                </span>
              )}
            </div>

            {/* EVM Blockchain Tx */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 gap-2">
              <div className="truncate">
                <span className="text-slate-500 mr-2">On-Chain Tx:</span>
                <span className="text-emerald-300 font-semibold truncate">{report.onChainTxHash || 'Pending on-chain notarization'}</span>
              </div>
              {report.onChainTxHash && (
                <span className="inline-flex items-center space-x-1 text-emerald-400 hover:underline text-[11px] shrink-0">
                  <ExternalLink className="w-3 h-3" />
                  <span>EVM Explorer</span>
                </span>
              )}
            </div>
          </div>

          {/* Generated Dynamic QR Code Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3 flex flex-col items-center justify-center">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>Generated QR Code</span>
            </div>

            {report.canonicalHash ? (
              <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-700">
                <img src={qrCodeDataUrl} alt="Certificate Verification QR Code" className="w-32 h-32" />
              </div>
            ) : (
              <div className="w-32 h-32 bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 text-xs font-mono">
                No Hash Available
              </div>
            )}

            <p className="text-[10px] text-slate-400 font-mono max-w-[180px]">
              Scan to ask hash & view uploaded certificate details
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Hash Modal */}
      {showHashPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative font-sans">
            <div className="flex items-center space-x-3 text-sky-400">
              <Key className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Enter Certificate Hash to Verify</h3>
            </div>

            <p className="text-xs text-slate-300">
              Paste or type the 64-character SHA-256 hash generated for your uploaded PDF certificate to load its complete verification report and record.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!promptHashInput.trim() || promptHashInput.trim().length !== 64) {
                  setHashPromptError('Please enter a valid 64-character SHA-256 hex string');
                  return;
                }
                setShowHashPromptModal(false);
                window.location.href = `/?hash=${promptHashInput.trim()}`;
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">SHA-256 Hash Parameter</label>
                <input
                  type="text"
                  required
                  value={promptHashInput}
                  onChange={(e) => setPromptHashInput(e.target.value)}
                  placeholder="Paste 64-character SHA-256 hash string..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono"
                />
              </div>

              {hashPromptError && <p className="text-xs text-rose-400 font-medium">{hashPromptError}</p>}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHashPromptModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20"
                >
                  Load Certificate Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
