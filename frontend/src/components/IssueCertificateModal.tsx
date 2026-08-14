import React, { useState, useEffect } from 'react';
import { X, Award, Sparkles, Loader2, FileUp, CheckCircle2, Hash } from 'lucide-react';
import { AdminApiService, StudentRecordUI, InstitutionRecordUI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

interface IssueCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const IssueCertificateModal: React.FC<IssueCertificateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();

  const [institutions, setInstitutions] = useState<InstitutionRecordUI[]>([]);
  const [students, setStudents] = useState<StudentRecordUI[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customStudentName, setCustomStudentName] = useState<string>('');
  const [customStudentRoll, setCustomStudentRoll] = useState<string>('');
  const [programName, setProgramName] = useState<string>('Cryptographic Security & Verification Systems');
  const [degree, setDegree] = useState<string>('BACHELOR_OF_SCIENCE');
  const [grade, setGrade] = useState<string>('FIRST_CLASS_HONORS');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // PDF file upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfHash, setPdfHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      AdminApiService.listInstitutions(token)
        .then((insts) => {
          setInstitutions(insts);
          if (insts.length > 0) {
            setSelectedInstitutionId(insts[0].id);
          }
        })
        .catch(() => {});

      AdminApiService.listStudents(token)
        .then((stus) => {
          setStudents(stus);
          if (stus.length > 0) {
            setSelectedStudentId(stus[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handlePdfUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF document (.pdf)');
      return;
    }
    setErrorMsg(null);
    setPdfFile(file);
    setIsHashing(true);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setPdfHash(hexHash);
    } catch {
      setErrorMsg('Failed to compute PDF SHA-256 hash');
    } finally {
      setIsHashing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await AdminApiService.createCertificate(token, {
        institutionId: selectedInstitutionId || (institutions[0]?.id || 'inst-vuniv-001'),
        studentId: selectedStudentId || undefined,
        studentName: customStudentName ? customStudentName.trim() : undefined,
        studentIdentifier: customStudentRoll ? customStudentRoll.trim() : undefined,
        programName: programName.trim(),
        degree: degree.trim(),
        grade: grade.trim(),
        issueDate,
        pdfHash: pdfHash || undefined,
      });

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue certificate');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden font-sans max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">Issue Digital Certificate</h3>
              <p className="text-xs text-slate-400">Compute SHA-256 hash, upload PDF & pin metadata to IPFS</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* PDF Certificate File Upload (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">Upload PDF Certificate Document (Optional)</label>
            <div className="p-4 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl transition-all text-center relative group">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center space-y-1.5 pointer-events-none">
                <FileUp className="w-7 h-7 text-sky-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-300">
                  {pdfFile ? pdfFile.name : 'Click or Drag PDF Certificate file here'}
                </p>
                <p className="text-[10px] text-slate-500">Supports PDF format • Computes direct SHA-256 document hash</p>
              </div>
            </div>

            {isHashing && (
              <div className="flex items-center space-x-2 text-xs text-sky-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Computing PDF SHA-256 hash...</span>
              </div>
            )}

            {pdfHash && (
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-sky-300 font-semibold block">PDF SHA-256 Hash Computed:</span>
                  <span className="font-mono text-[11px] text-sky-200 truncate block">{pdfHash}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Issuing Institution</label>
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              >
                {institutions.length > 0 ? (
                  institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))
                ) : (
                  <option value="inst-vuniv-001">Verification University (VUNIV)</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Recipient Student</label>
              {students.length > 0 ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.first_name} {stu.last_name} ({stu.student_identifier})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Student Full Name (e.g. Jane Doe)"
                  value={customStudentName}
                  onChange={(e) => setCustomStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-100"
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Program / Degree Major</label>
            <input
              type="text"
              required
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. Computer Science & Artificial Intelligence"
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Degree</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              >
                <option value="BACHELOR_OF_SCIENCE">Bachelor of Science</option>
                <option value="BACHELOR_OF_ARTS">Bachelor of Arts</option>
                <option value="MASTER_OF_SCIENCE">Master of Science</option>
                <option value="DOCTOR_OF_PHILOSOPHY">Doctor of Philosophy</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Grade / Distinction</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. First Class Honors"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex items-center space-x-1.5 text-sky-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated Execution Pipeline</span>
            </div>
            <p className="text-[11px] text-slate-500">
              1. Compute RFC-8785 canonical JSON string • 2. Calculate SHA-256 hash • 3. Pin metadata to IPFS Gateway • 4. Store ledger record in database
            </p>
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
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing & Pinning...</span>
                </>
              ) : (
                <>
                  <span>Issue & Pin Certificate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
