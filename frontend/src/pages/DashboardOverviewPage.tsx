import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Award, Users, Building2, ShieldAlert, PlusCircle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { AdminApiService, CertificateRecordUI, StudentRecordUI, InstitutionRecordUI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { IssueCertificateModal } from '../components/IssueCertificateModal';
import { Link } from 'react-router-dom';

export const DashboardOverviewPage: React.FC = () => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRecordUI[]>([]);
  const [students, setStudents] = useState<StudentRecordUI[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRecordUI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [certs, stus, insts] = await Promise.all([
        AdminApiService.listCertificates(token),
        AdminApiService.listStudents(token),
        AdminApiService.listInstitutions(token)
      ]);
      setCertificates(certs);
      setStudents(stus);
      setInstitutions(insts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const activeCerts = certificates.filter((c) => c.status === 'ISSUED').length;
  const revokedCerts = certificates.filter((c) => c.status === 'REVOKED').length;

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">System Control Dashboard</h1>
            <p className="text-xs text-slate-400">Real-time overview of issued credentials, active institutions, and blockchain notarization ledger.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Certificate</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Issued</span>
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-50">{certificates.length}</p>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {activeCerts} Active Notarized
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Enrolled Students</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-50">{students.length}</p>
            <p className="text-[11px] text-slate-500 font-mono">Across registered institutions</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Institutions</span>
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-50">{institutions.length}</p>
            <p className="text-[11px] text-teal-400 font-mono">Active verified issuers</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Revoked Credentials</span>
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-50">{revokedCerts}</p>
            <p className="text-[11px] text-rose-400 font-mono">Administrative revocations</p>
          </div>
        </div>

        {/* Recent Issued Certificates Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">Recent Notarized Credentials</h2>
            <Link to="/dashboard/certificates" className="text-xs text-sky-400 hover:underline flex items-center space-x-1">
              <span>View All Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Cert Number</th>
                  <th className="py-3 px-4">Program / Degree</th>
                  <th className="py-3 px-4">SHA-256 Canonical Hash</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Issue Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {certificates.slice(0, 5).map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                    <td className="py-3 px-4 text-sky-300 font-bold">{cert.certificate_number}</td>
                    <td className="py-3 px-4 font-sans text-slate-200 font-medium">{cert.program_name}</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]">{cert.canonical_hash}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          cert.status === 'ISSUED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{new Date(cert.issue_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Certificate Modal */}
        <IssueCertificateModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          onSuccess={fetchData}
        />
      </div>
    </DashboardLayout>
  );
};
