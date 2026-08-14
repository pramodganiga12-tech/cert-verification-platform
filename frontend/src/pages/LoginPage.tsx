import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Key, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthApiService } from '../services/authApi';
import { ParticleBackground3D } from '../components/ParticleBackground3D';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@platform.local');
  const [password, setPassword] = useState<string>('Admin@123456');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await AuthApiService.login(email, password);
      login(data.accessToken, data.refreshToken, data.user);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify email and password.');
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Admin@123456');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative font-sans selection:bg-sky-500 selection:text-white overflow-hidden">
      {/* 3D Animated Interactive Particle Mesh Canvas */}
      <ParticleBackground3D />

      {/* Dynamic Ambient Neon Cones */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* 3D Floating Glass Card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-950/40 backdrop-blur-2xl relative z-10 space-y-6 transform hover:scale-[1.005] transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 rounded-2xl shadow-xl shadow-sky-500/25 text-white ring-4 ring-slate-800/80">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-slate-50 via-sky-100 to-indigo-200 bg-clip-text text-transparent tracking-tight">
              Institution Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to issue, manage, and audit blockchain academic credentials.
            </p>
          </div>
        </div>

        {/* Quick Demo Autofill Credentials */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-semibold">
            <Key className="w-3.5 h-3.5" />
            <span>Quick Demo Credentials</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@platform.local')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-[11px] font-mono rounded-xl border border-slate-700/80 transition-all text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('issuer@vuniv.edu')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-[11px] font-mono rounded-xl border border-slate-700/80 transition-all text-center"
            >
              Institution Issuer
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-2 text-rose-300 text-xs font-medium animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@platform.local"
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-sans transition-all focus:ring-2 focus:ring-sky-500/20"
              />
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-sans transition-all focus:ring-2 focus:ring-sky-500/20"
              />
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            Secured by EVM Smart Contracts & IPFS Metadata Gateway
          </p>
        </div>
      </div>
    </div>
  );
};
