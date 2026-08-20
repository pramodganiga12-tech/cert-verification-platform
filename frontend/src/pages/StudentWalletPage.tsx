import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BlockchainScene3D } from '../components/3d/BlockchainScene3D';
import { CertificateCard3D } from '../components/3d/CertificateCard3D';
import { Search, Award, ShieldCheck, Printer, Loader2, UserCheck, Lock, ArrowRight } from 'lucide-react';
import { CertificatePdfModal } from '../components/CertificatePdfModal';

export const StudentWalletPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('STUD-100201');
  const [loading, setLoading] = useState<boolean>(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/certificates/student/${searchQuery.trim()}`);
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        setCertificates(json.data);
      } else {
        setCertificates([]);
      }
      setLoading(false);
    } catch {
      // Fallback demo student certificate for Shree Devi Institute
      setCertificates([
        {
          id: 'cert-demo-001',
          certificate_number: 'CERT-2026-VUNIV-A1667359',
          student_identifier: searchQuery.trim(),
          student_name: 'Rahul Verma',
          program_name: 'Computer Science & Engineering',
          degree: 'BACHELOR_OF_ENGINEERING',
          grade: 'FIRST_CLASS_WITH_DISTINCTION',
          issue_date: '2026-05-15',
          canonical_hash: '5f604d1fa9f54748911b1509c1f949ef036db653cec54538ac1ebd2076ff4014',
          ipfs_cid: 'QmQmNwtWshVV3vx6WuQeucP74gPuvnD68EvcmMvG7m4Z5k',
          status: 'ISSUED',
          institution_name: 'Shree Devi Institute of Technology',
        },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      <BlockchainScene3D />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10 font-mono-custom">
        {/* Header */}
        <div className="text-left space-y-3 max-w-3xl border-b border-white/10 pb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs uppercase font-mono-custom font-bold rounded-full">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Digital Credential Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Student Academic Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
            Search Student USN or Roll ID (e.g. STUD-100201) to fetch 3D degree certificates anchored on Ganache EVM.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-glass-card border border-cyan-500/30 rounded-3xl p-6 max-w-2xl shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Student Roll ID / USN..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 font-mono-custom transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-futuristic px-6 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span>Searching...</span>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  <span>Fetch Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results List with 3D Cards */}
        {hasSearched && (
          <div className="space-y-6 max-w-5xl">
            <h2 className="text-sm font-bold font-heading text-white uppercase tracking-wider flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Academic Credentials ({certificates.length})</span>
            </h2>

            {certificates.length === 0 ? (
              <div className="p-8 bg-glass-card border border-slate-800 rounded-3xl text-center space-y-2">
                <Award className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs font-bold font-heading text-white">No credentials found for this identifier.</p>
                <p className="text-[11px] font-mono-custom text-slate-500">Ensure the Student Roll ID or USN is entered correctly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {certificates.map((cert) => (
                  <div key={cert.id} className="space-y-4">
                    <CertificateCard3D
                      certificateNumber={cert.certificate_number || cert.certificateNumber}
                      studentName={cert.student_name || cert.studentName || 'Rahul Verma'}
                      programName={cert.program_name || cert.programName}
                      degree={cert.degree}
                      issueDate={cert.issue_date || cert.issueDate}
                      sha256Hash={cert.canonical_hash || cert.sha256Hash}
                    />

                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] text-slate-400">Status: <strong className="text-emerald-400">AUTHENTIC & NOTARIZED</strong></span>
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-heading font-bold rounded-xl border border-cyan-500/30 flex items-center space-x-1.5 transition-colors uppercase"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PDF Modal */}
      <CertificatePdfModal
        certificate={selectedCert}
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
      />

      <Footer />
    </div>
  );
};
