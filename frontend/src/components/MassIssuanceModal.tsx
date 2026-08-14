import React, { useState } from 'react';
import { X, Archive, Sparkles, Loader2, CheckCircle2, AlertCircle, FileText, UploadCloud, ShieldCheck, Cpu, Hash, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MassIssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BatchItemResult {
  fileName: string;
  success: boolean;
  certificateNumber?: string;
  canonicalHash?: string;
  ipfsCid?: string;
  errorReason?: string;
  studentName?: string;
  programName?: string;
}

interface BatchResponseData {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: BatchItemResult[];
}

export const MassIssuanceModal: React.FC<MassIssuanceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [programName, setProgramName] = useState<string>('Computer Science & Engineering');
  const [degree, setDegree] = useState<string>('BACHELOR_OF_ENGINEERING');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResponseData | null>(null);

  if (!isOpen) return null;

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    setErrorMsg(null);
    setSelectedFiles(fileList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || selectedFiles.length === 0 || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setBatchResult(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('programName', programName);
    formData.append('degree', degree);

    try {
      const res = await fetch('/api/batch/mass-issuance', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Mass issuance processing failed');
      }

      setBatchResult(payload.data);
      setIsLoading(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process mass issuance batch');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-sans max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 via-indigo-600 to-teal-400 rounded-xl text-white shadow-lg shadow-sky-500/20">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">PHASE 1 — MASS CERTIFICATE ISSUANCE</h3>
              <p className="text-xs text-slate-400">Upload PDF batch / ZIP package &rarr; 9-Step Verification &amp; Blockchain Anchoring Pipeline</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 9-Step Pipeline Banner (Exact Slide Diagram) */}
        <div className="p-4 bg-slate-950 border border-slate-800/90 rounded-2xl space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>PHASE 1: MASS ISSUANCE FLOW (9-STEP ENGINE)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Blockchain Document Assistant</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-center font-mono text-[9px]">
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-sky-400 block font-bold">1</span> Drop Batch
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-sky-400 block font-bold">2</span> Parse Text
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-sky-400 block font-bold">3</span> Check Validity
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-emerald-400 block font-bold">4</span> Approved Doc
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-teal-400 block font-bold">5</span> SHA-256
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-indigo-400 block font-bold">6</span> IPFS CID
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-amber-400 block font-bold">7</span> Stamp QR
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-purple-400 block font-bold">8</span> Blockchain
            </div>
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-emerald-400 block font-bold">9</span> Complete
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Batch Results View */}
        {batchResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-3 gap-4 text-center font-mono text-xs">
              <div className="p-2 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 block">TOTAL PROCESSED</span>
                <span className="text-lg font-bold text-slate-100">{batchResult.totalProcessed}</span>
              </div>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] text-emerald-400 block">SUCCESSFUL</span>
                <span className="text-lg font-bold text-emerald-400">{batchResult.successCount}</span>
              </div>
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <span className="text-[10px] text-rose-400 block">REJECTED / STOPPED</span>
                <span className="text-lg font-bold text-rose-400">{batchResult.failureCount}</span>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 font-mono text-xs">
              {batchResult.results.map((resItem, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    resItem.success
                      ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {resItem.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-sans font-bold block truncate">{resItem.fileName}</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {resItem.success
                          ? `DocID: ${resItem.certificateNumber} | SHA256: ${resItem.canonicalHash?.slice(0, 16)}... | CID: ${resItem.ipfsCid?.slice(0, 10)}...`
                          : resItem.errorReason}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Input */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                1. Admin / Issuer Drop PDF Batch or ZIP Package
              </label>
              <div className="p-6 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl transition-all text-center relative group">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.zip,application/pdf,application/zip"
                  onChange={(e) => handleFilesSelect(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-2 pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-sky-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-slate-200">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) selected: ${selectedFiles.map((f) => f.name).join(', ').slice(0, 50)}...`
                      : 'Click or Drag PDF files / ZIP package here'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Supports multiple certificate PDFs (e.g. Student_001.pdf, Student_002.pdf) or ZIP archive
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Department / Program Name</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Degree Qualification</label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                >
                  <option value="BACHELOR_OF_ENGINEERING">Bachelor of Engineering (B.E.)</option>
                  <option value="BACHELOR_OF_SCIENCE">Bachelor of Science (B.Sc.)</option>
                  <option value="MASTER_OF_TECHNOLOGY">Master of Technology (M.Tech)</option>
                  <option value="MASTER_OF_COMPUTER_APPLICATIONS">Master of Computer Applications (MCA)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || selectedFiles.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing 9-Step Mass Batch...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Phase 1 Mass Issuance Flow</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
