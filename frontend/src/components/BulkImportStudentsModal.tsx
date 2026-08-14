import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AdminApiService, InstitutionRecordUI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

interface BulkImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportStudentsModal: React.FC<BulkImportStudentsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState<InstitutionRecordUI[]>([]);
  const [institutionId, setInstitutionId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      AdminApiService.listInstitutions(token)
        .then((insts) => {
          setInstitutions(insts);
          if (insts.length > 0) setInstitutionId(insts[0].id);
        })
        .catch((err) => setErrorMsg(err.message));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedFile || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await AdminApiService.bulkImportStudents(token, institutionId, selectedFile);
      setImportResult(res);
      setIsLoading(false);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'CSV bulk import failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl text-white">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">CSV Bulk Import Students</h3>
              <p className="text-xs text-slate-400">Batch enroll student profiles from CSV file</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {!importResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Target Institution</label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            <div
              className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60"
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-1">
                  <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-200">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-sky-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Click or drop CSV file here</p>
                  <p className="text-[11px] text-slate-500 font-mono">Format: studentIdentifier, firstName, lastName, email, dob</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Process CSV Import</span>}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>CSV Import Complete</span>
              </div>
              <p className="text-xs text-slate-300">
                Successfully processed {importResult.totalProcessed} records ({importResult.successCount} inserted, {importResult.failureCount} errors).
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
