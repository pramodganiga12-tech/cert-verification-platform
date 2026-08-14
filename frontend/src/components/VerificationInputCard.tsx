import React, { useState } from 'react';
import { Search, Hash, FileCode, UploadCloud, QrCode, ArrowRight, Loader2, Sparkles, FileCheck } from 'lucide-react';
import { VerificationReport } from '../types/verification';
import { VerificationApiService } from '../services/api';

interface VerificationInputCardProps {
  onVerificationStart: () => void;
  onVerificationComplete: (report: VerificationReport) => void;
  onError: (errorMsg: string) => void;
  isLoading: boolean;
}

type TabType = 'hash' | 'id' | 'pdf' | 'json' | 'qr';

export const VerificationInputCard: React.FC<VerificationInputCardProps> = ({
  onVerificationStart,
  onVerificationComplete,
  onError,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('hash');
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    onVerificationStart();

    try {
      let report: VerificationReport;

      switch (activeTab) {
        case 'hash':
          if (!inputValue.trim() || inputValue.trim().length !== 64) {
            throw new Error('Please enter a valid 64-character SHA-256 hex string');
          }
          report = await VerificationApiService.verifyByHash(inputValue.trim());
          break;

        case 'id':
          if (!inputValue.trim()) {
            throw new Error('Please enter a valid Certificate ID or Certificate Number');
          }
          report = await VerificationApiService.verifyById(inputValue.trim());
          break;

        case 'json':
          if (!inputValue.trim()) {
            throw new Error('Please paste valid JSON certificate payload metadata');
          }
          let parsed: any;
          try {
            parsed = JSON.parse(inputValue.trim());
          } catch {
            throw new Error('Invalid JSON format. Please verify JSON syntax before submitting.');
          }
          report = await VerificationApiService.verifyByJSON(parsed);
          break;

        case 'qr':
          if (!inputValue.trim()) {
            throw new Error('Please paste or scan QR code payload text');
          }
          report = await VerificationApiService.verifyByQR(inputValue.trim());
          break;

        case 'pdf':
          if (!selectedFile) {
            throw new Error('Please select or drag-and-drop a PDF certificate file');
          }
          report = await VerificationApiService.verifyByPDF(selectedFile);
          break;

        default:
          throw new Error('Unsupported verification method');
      }

      onVerificationComplete(report);
    } catch (err: any) {
      onError(err.message || 'An unexpected verification error occurred');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        onError('Only PDF files are supported for file verification.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        onError('Only PDF files are supported for file verification.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'hash', label: 'SHA-256 Hash', icon: Hash },
    { id: 'id', label: 'Cert ID / Number', icon: Search },
    { id: 'pdf', label: 'PDF Document', icon: UploadCloud },
    { id: 'json', label: 'Raw JSON', icon: FileCode },
    { id: 'qr', label: 'QR Payload', icon: QrCode },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-950/20 backdrop-blur-xl relative overflow-hidden">
      {/* Glow highlight background */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-500/10 text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decentralized Verification Gateway</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
          Verify Academic Credentials
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
          Instantly audit digital certificates against local IPFS metadata and EVM Smart Contract state logs.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-6 relative z-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setInputValue('');
                setSelectedFile(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {activeTab === 'hash' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Canonical SHA-256 Hex Hash (64 characters)
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. 5f604d1fa9f54748911b1509c1f949ef036db653cec54538ac1ebd2076ff4014"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 font-mono transition-all"
              />
              <Hash className="absolute right-4 top-3.5 w-5 h-5 text-slate-600 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Tip: The SHA-256 hash is printed at the bottom of official transcript PDFs and QR codes.
            </p>
          </div>
        )}

        {activeTab === 'id' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Certificate Number or System UUID
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. CERT-2026-VUNIV-A1667359 or 8eb5e02f-ee4c-4919-88f8-4da110dc920c"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 font-mono transition-all"
              />
              <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-600 pointer-events-none" />
            </div>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
            onClick={() => document.getElementById('pdf-file-input')?.click()}
          >
            <input
              id="pdf-file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FileCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • Click or drag another file to replace</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-slate-800/80 text-sky-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-700">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    <span className="text-sky-400 font-semibold">Click to upload</span> or drag and drop PDF certificate
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Official platform PDF certificates up to 10MB</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Raw JSON Certificate Payload
            </label>
            <textarea
              rows={5}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`{\n  "certificateNumber": "CERT-2026-VUNIV-...",\n  "institutionId": "...",\n  "studentId": "...",\n  "programName": "Computer Science",\n  "degree": "BACHELOR_OF_SCIENCE",\n  "issueDate": "2026-05-01"\n}`}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 font-mono transition-all"
            />
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              QR Code String or Scanned Payload
            </label>
            <textarea
              rows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste raw QR code text or JSON payload here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 font-mono transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:via-indigo-500 hover:to-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running 12-Step Cryptographic Verification Pipeline...</span>
            </>
          ) : (
            <>
              <span>Execute Verification Check</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
