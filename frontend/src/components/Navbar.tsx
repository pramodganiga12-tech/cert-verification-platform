import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Database, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setIsHealthy(data.status === 'ok');
      })
      .catch(() => setIsHealthy(false));
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-100 via-sky-100 to-indigo-200 bg-clip-text text-transparent">
                CertTrust EVM
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700 font-mono">
                v1.0.0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-4 text-xs font-semibold">
              <a href="/" className="text-slate-300 hover:text-sky-400 transition-colors">
                Public Verification
              </a>
              <a href="/wallet" className="text-slate-300 hover:text-sky-400 transition-colors">
                Student Wallet
              </a>
              <a href="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
                Institution Login
              </a>
            </nav>

            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hardhat EVM + Local IPFS</span>
            </div>

            <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">Node Status:</span>
              {isHealthy === null ? (
                <span className="text-amber-400 font-medium animate-pulse">Checking...</span>
              ) : isHealthy ? (
                <span className="flex items-center text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Online
                </span>
              ) : (
                <span className="flex items-center text-rose-400 font-medium">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
