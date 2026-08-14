import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ShieldCheck, Search, ShieldAlert, CheckCircle2, FileText, Activity, RefreshCw } from 'lucide-react';
import { AuditApiService, AuditLogItem, VerificationAnalyticsPayload } from '../services/auditApi';
import { useAuth } from '../context/AuthContext';

export const AuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [analytics, setAnalytics] = useState<VerificationAnalyticsPayload | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [logsData, analyticsData] = await Promise.all([
        AuditApiService.getAuditLogs(token),
        AuditApiService.getVerificationAnalytics(token),
      ]);
      setAuditLogs(logsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const filteredLogs = auditLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.entity_type.toLowerCase().includes(query) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(query)) ||
      (log.details && log.details.toLowerCase().includes(query))
    );
  });

  return (
    <DashboardLayout activeTab="audit">
      <div className="space-y-8 max-w-7xl mx-auto font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">System Audit Logs & Verification Analytics</h1>
            <p className="text-xs text-slate-400">Immutable ledger of platform operational events and live verification metrics.</p>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Verifications</span>
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-50">{analytics.counts.total}</p>
              <p className="text-[11px] text-slate-500 font-mono">Public & Portal Queries</p>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Verified Authentic</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-50">{analytics.counts.verified}</p>
              <p className="text-[11px] text-emerald-400 font-mono">100% Cryptographic Match</p>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Tampered / Invalid</span>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-50">{analytics.counts.tampered}</p>
              <p className="text-[11px] text-amber-400 font-mono">Hash Mismatches Intercepted</p>
            </div>

            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Revoked Checks</span>
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-50">{analytics.counts.revoked}</p>
              <p className="text-[11px] text-rose-400 font-mono">Revoked Credential Inquiries</p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions (e.g. CERTIFICATE_ISSUED), entity types, or IP addresses..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-sans"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        {/* Audit Log Datatable */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sky-300">{log.action}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.entity_type}</td>
                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-[160px]">{log.entity_id || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-emerald-400">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
