import React, { useEffect, useState } from 'react';
import { ShieldCheck, Server, Database, Lock } from 'lucide-react';

interface ApiHealth {
  status: string;
  message: string;
  timestamp: string;
  environment: string;
}

export default function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to connect to API:', err);
        setError('Could not reach backend API server');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-50">
              Blockchain Academic Certificate Verification Platform
            </h1>
            <p className="text-slate-400 text-sm">Phase 1 Foundation Setup & Architecture Verification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 text-sm font-semibold">
              <Server size={18} />
              <span>Backend Status</span>
            </div>
            {loading ? (
              <p className="text-slate-400 text-xs">Checking server API...</p>
            ) : error ? (
              <p className="text-rose-400 text-xs font-mono">{error}</p>
            ) : (
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20 font-medium">
                  {health?.status.toUpperCase()}
                </span>
                <p className="text-slate-400 text-[11px] mt-1 font-mono">{health?.environment}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold">
              <Database size={18} />
              <span>Storage & Ledger</span>
            </div>
            <p className="text-slate-300 text-xs font-mono">SQLite + Local IPFS + Ethereum Hardhat</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
              <Lock size={18} />
              <span>Security</span>
            </div>
            <p className="text-slate-300 text-xs font-mono">SHA-256 / Keccak-256 + AES-256-GCM</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 flex justify-between items-center">
          <span>Phase 1 Completed successfully</span>
          <span>System Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
}
