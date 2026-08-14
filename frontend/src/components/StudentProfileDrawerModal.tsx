import React, { useState, useEffect } from 'react';
import { X, User, Award, FileUp, PlusCircle, CheckCircle2, ShieldCheck, Printer, FileText, Hash, ExternalLink, Loader2 } from 'lucide-react';
import { StudentRecordUI, CertificateRecordUI, AdminApiService } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { CertificatePdfModal } from './CertificatePdfModal';
import { IssueCertificateModal } from './IssueCertificateModal';

interface StudentProfileDrawerModalProps {
  student: StudentRecordUI | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDeleteRequest?: (student: StudentRecordUI) => void;
}

interface StudentDocument {
  id: string;
  name: string;
  size: number;
  hash: string;
  uploadedAt: string;
}

export const StudentProfileDrawerModal: React.FC<StudentProfileDrawerModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdate,
  onDeleteRequest,
}) => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecordUI[]>([]);
  const [loadingCerts, setLoadingCerts] = useState<boolean>(false);
  
  // Selected cert for PDF view
  const [selectedCertForPdf, setSelectedCertForPdf] = useState<CertificateRecordUI | null>(null);
  
  // Issue cert modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);

  // Student documents upload state
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [docUploadMsg, setDocUploadMsg] = useState<string | null>(null);

  const fetchStudentCertificates = async () => {
    if (!token || !student) return;
    setLoadingCerts(true);
    try {
      const allCerts = await AdminApiService.listCertificates(token);
      const studentCerts = allCerts.filter(
        (c) => c.student_id === student.id || c.certificate_number.toLowerCase().includes(student.student_identifier.toLowerCase())
      );
      setCertificates(studentCerts);
    } catch {
      // Ignore list error
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentCertificates();
      // Load any previously cached docs for this student from localStorage
      try {
        const saved = localStorage.getItem(`student_docs_${student.id}`);
        if (saved) {
          setDocuments(JSON.parse(saved));
        } else {
          setDocuments([]);
        }
      } catch {
        setDocuments([]);
      }
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleDocumentUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setDocUploadMsg('Please select a valid PDF document (.pdf)');
      return;
    }
    setDocUploadMsg(null);
    setIsUploadingDoc(true);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const newDoc: StudentDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: file.size,
        hash: hexHash,
        uploadedAt: new Date().toISOString(),
      };

      const updated = [newDoc, ...documents];
      setDocuments(updated);
      try {
        localStorage.setItem(`student_docs_${student.id}`, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      setDocUploadMsg(`Successfully uploaded & computed SHA-256 hash for "${file.name}"`);
    } catch {
      setDocUploadMsg('Failed to process PDF document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-y-auto font-sans flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 rounded-2xl text-white shadow-lg shadow-sky-500/20">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-50">{student.first_name} {student.last_name}</h2>
                  <p className="text-xs text-sky-400 font-mono font-semibold">Roll ID: {student.student_identifier}</p>
                </div>
              </div>

              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Email Address</span>
                <span className="text-slate-200 font-medium truncate block">{student.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Date of Birth</span>
                <span className="text-slate-200 font-medium block">{student.dob || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Registration Date</span>
                <span className="text-slate-200 font-medium block">{new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Issued Academic Certificates Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>Issued Certificates ({certificates.length})</span>
                </div>

                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-[11px] rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Issue New Certificate</span>
                </button>
              </div>

              {loadingCerts ? (
                <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Fetching student certificates...</span>
                </div>
              ) : certificates.length === 0 ? (
                <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center space-y-2">
                  <Award className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No certificates issued yet for this student.</p>
                  <button
                    onClick={() => setIsIssueModalOpen(true)}
                    className="px-3.5 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-semibold rounded-xl border border-sky-500/20 inline-flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Issue First Certificate</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-100 block">{cert.program_name}</span>
                          <span className="text-[11px] text-sky-400 font-mono">{cert.certificate_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                              cert.status === 'ISSUED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {cert.status}
                          </span>

                          <button
                            onClick={() => setSelectedCertForPdf(cert)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold flex items-center space-x-1"
                            title="Print or View Certificate PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Print PDF</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2 font-mono pt-1 border-t border-slate-900">
                        <div className="truncate">
                          <span className="text-slate-500 block text-[9px]">CANONICAL SHA-256:</span>
                          <span className="text-slate-300 truncate block">{cert.canonical_hash}</span>
                        </div>
                        {cert.pdf_hash && (
                          <div className="truncate">
                            <span className="text-slate-500 block text-[9px]">PDF DOCUMENT HASH:</span>
                            <span className="text-sky-300 truncate block">{cert.pdf_hash}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload PDF Documents & Records Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
                  <FileUp className="w-4 h-4 text-sky-400" />
                  <span>Student Documents & PDF Attachments ({documents.length})</span>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-4 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl transition-all text-center relative group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleDocumentUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-1.5 pointer-events-none">
                  <FileUp className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-slate-300">Click or drag PDF document to attach for this student</p>
                  <p className="text-[10px] text-slate-500">Supports PDF transcripts, degree copies & certificates • Calculates SHA-256 hash automatically</p>
                </div>
              </div>

              {isUploadingDoc && (
                <div className="flex items-center space-x-2 text-xs text-sky-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing PDF SHA-256 hash & storing document...</span>
                </div>
              )}

              {docUploadMsg && (
                <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{docUploadMsg}</span>
                </div>
              )}

              {/* Document List */}
              {documents.length > 0 && (
                <div className="space-y-2 pt-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-sans font-bold text-slate-200 block truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">SHA-256: {doc.hash}</span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500 shrink-0 font-sans">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            {onDeleteRequest && (
              <button
                onClick={() => {
                  if (student) onDeleteRequest(student);
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-semibold text-xs rounded-xl border border-rose-500/20 transition-all flex items-center space-x-1.5"
              >
                <span>Remove Student Roll ID</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Close Profile
            </button>
          </div>

        </div>
      </div>

      {/* Printable Certificate PDF Modal */}
      <CertificatePdfModal
        certificate={selectedCertForPdf}
        isOpen={!!selectedCertForPdf}
        onClose={() => setSelectedCertForPdf(null)}
      />

      {/* Issue Certificate Modal for This Student */}
      <IssueCertificateModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={() => {
          fetchStudentCertificates();
          onUpdate();
        }}
      />
    </>
  );
};
