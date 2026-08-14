import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Search, PlusCircle, RefreshCw, XCircle, Award, Globe, ExternalLink, ShieldAlert, CheckCircle2, Archive, Download } from 'lucide-react';
import { AdminApiService, CertificateRecordUI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { IssueCertificateModal } from '../components/IssueCertificateModal';
import { MassIssuanceModal } from '../components/MassIssuanceModal';

export const CertificateRegistryPage: React.FC = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecordUI[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUED' | 'REVOKED'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [isMassIssuanceOpen, setIsMassIssuanceOpen] = useState<boolean>(false);

  // Revocation modal state
  const [selectedRevokeCert, setSelectedRevokeCert] = useState<CertificateRecordUI | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('Academic integrity policy violation');
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await AdminApiService.listCertificates(token);
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [token]);

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedRevokeCert || isRevoking) return;

    setIsRevoking(true);
    setRevokeError(null);

    try {
      await AdminApiService.revokeCertificate(token, selectedRevokeCert.id, revokeReason.trim());
      setIsRevoking(false);
      setSelectedRevokeCert(null);
      fetchCertificates();
    } catch (err: any) {
      setRevokeError(err.message || 'Revocation failed');
      setIsRevoking(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.canonical_hash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout activeTab="certificates">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">Academic Certificate Registry</h1>
            <p className="text-xs text-slate-400">Shree Devi Institute of Technology • Phase 1 Mass Issuance, SHA-256, IPFS & EVM Ledger.</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsMassIssuanceOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all"
            >
              <Archive className="w-4 h-4 text-sky-400" />
              <span>Mass Batch Issuance</span>
            </button>

            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue New Certificate</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Cert Number, Program, or Canonical Hash..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">ISSUED Only</option>
            <option value="REVOKED">REVOKED Only</option>
          </select>

          <button
            onClick={fetchCertificates}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Datatable */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Cert Number / ID</th>
                  <th className="py-3 px-4">Program / Major</th>
                  <th className="py-3 px-4">Canonical SHA-256 Hash</th>
                  <th className="py-3 px-4">IPFS CID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No certificates match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-sky-400">
                        {cert.certificate_number}
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-200 font-medium max-w-[200px] truncate">
                        {cert.program_name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="truncate block max-w-[180px]" title={cert.canonical_hash}>
                          {cert.canonical_hash.slice(0, 16)}...
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-indigo-400">
                        {cert.ipfs_cid ? (
                          <a
                            href={`https://ipfs.io/ipfs/${cert.ipfs_cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center space-x-1"
                          >
                            <span>{cert.ipfs_cid.slice(0, 10)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            cert.status === 'ISSUED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {cert.status === 'ISSUED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{cert.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 font-sans">
                        <a
                          href={`/api/certificates/${cert.id}/download-pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-[11px] font-semibold rounded-lg border border-sky-500/20 transition-all inline-flex items-center space-x-1"
                          title="Download QR-Stamped Official PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download PDF</span>
                        </a>

                        {cert.status === 'ISSUED' && (
                          <button
                            onClick={() => setSelectedRevokeCert(cert)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[11px] font-semibold rounded-lg border border-rose-500/20 transition-all"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revocation Confirmation Modal */}
        {selectedRevokeCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 font-sans">
              <div className="flex items-center space-x-3 text-rose-400 border-b border-slate-800 pb-3">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-100">Revoke Academic Certificate</h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  You are about to revoke certificate number{' '}
                  <strong className="text-sky-400 font-mono">{selectedRevokeCert.certificate_number}</strong>.
                </p>
                <p className="text-slate-400">
                  Revocation sets the certificate status to <span className="text-rose-400 font-bold">REVOKED</span> on the blockchain ledger & invalidates future verification checks.
                </p>
              </div>

              {revokeError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {revokeError}
                </div>
              )}

              <form onSubmit={handleRevokeSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-medium text-slate-300">Reason for Revocation</label>
                  <input
                    type="text"
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Academic misconduct, administrative cancellation"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRevokeCert(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRevoking}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50"
                  >
                    {isRevoking ? 'Revoking...' : 'Confirm Revocation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Issue Certificate Modal */}
        <IssueCertificateModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onSuccess={fetchCertificates}
        />

        {/* Mass Batch Issuance Modal */}
        <MassIssuanceModal
          isOpen={isMassIssuanceOpen}
          onClose={() => setIsMassIssuanceOpen(false)}
          onSuccess={fetchCertificates}
        />
      </div>
    </DashboardLayout>
  );
};
