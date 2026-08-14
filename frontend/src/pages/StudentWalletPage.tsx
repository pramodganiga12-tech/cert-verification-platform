import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Search, Award, ShieldCheck, Printer, ExternalLink, Loader2, UserCheck, Sparkles } from 'lucide-react';
import { CertificateRecordUI } from '../services/adminApi';
import { CertificatePdfModal } from '../components/CertificatePdfModal';

export const StudentWalletPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('STUD-100201');
  const [loading, setLoading] = useState<boolean>(false);
  const [certificates, setCertificates] = useState<CertificateRecordUI[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected PDF modal state
  const [selectedCert, setSelectedCert] = useState<CertificateRecordUI | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      // Query backend for certificates by student ID or roll number
      const res = await fetch(`/api/certificates/student/${searchQuery.trim()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setCertificates(json.data);
      } else {
        // Fallback search across public verification hash/number if not direct ID
        const hashRes = await fetch('/api/verify/hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash: searchQuery.trim() }),
        });
        const hashJson = await hashRes.json();
        if (hashRes.ok && hashJson.data && hashJson.data.certificate) {
          setCertificates([hashJson.data.certificate]);
        } else {
          setCertificates([]);
        }
      }
    } catch (err: any) {
      setErrorMsg('No credentials found matching student identifier.');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full space-y-10">
        {/* Page Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Credential Wallet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
            Student Academic Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Search student roll number or email to inspect verified academic degrees and print official notarized certificates.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Student Roll ID or Cert Number (e.g. STUD-100201)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 font-sans"
              />
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search Wallet</span>}
            </button>
          </form>
        </div>

        {/* Results List */}
        {hasSearched && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-sky-400" />
              <span>Verified Academic Credentials ({certificates.length})</span>
            </h2>

            {certificates.length === 0 ? (
              <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-2">
                <Award className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No credentials found for this identifier.</p>
                <p className="text-xs text-slate-500">Ensure the Student Roll ID or Certificate Number is entered correctly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-sky-400 font-bold px-2 py-0.5 bg-sky-500/10 rounded border border-sky-500/20">
                          {cert.certificate_number}
                        </span>
                        <h3 className="text-base font-bold text-slate-100 leading-snug">{cert.program_name}</h3>
                      </div>
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 font-sans">
                      <p>Degree: <strong className="text-slate-100">{cert.degree}</strong></p>
                      <p>Honors Level: <strong className="text-amber-300">{cert.grade}</strong></p>
                      <p>Issue Date: <span className="text-slate-400">{new Date(cert.issue_date).toLocaleDateString()}</span></p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500 truncate max-w-[150px]">
                        {cert.canonical_hash}
                      </span>

                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold rounded-xl border border-sky-500/20 flex items-center space-x-1.5 transition-all"
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
