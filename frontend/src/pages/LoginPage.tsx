import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Key, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthApiService } from '../services/authApi';
import { BlockchainScene3D } from '../components/3d/BlockchainScene3D';

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
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      {/* 3D Animated Blockchain WebGL Canvas */}
      <BlockchainScene3D />

      {/* Ambient Neon Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[200px] pointer-events-none" />

      {/* Glassmorphism Login Card */}
      <div className="w-full max-w-md bg-glass-elevated border border-glass-light rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 transform hover:scale-[1.005] transition-all duration-300">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-cyan-500 via-sky-500 to-violet-600 rounded-2xl shadow-xl shadow-cyan-500/25 text-white ring-4 ring-white/5">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-gradient-cyan tracking-tight">
              Institution Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono-custom">
              Sign in to issue, manage, and audit blockchain academic credentials.
            </p>
          </div>
        </div>

        {/* Quick Demo Autofill — Glassmorphism Panel */}
        <div className="p-3.5 bg-glass-card border border-glass rounded-2xl space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold font-mono-custom">
            <Key className="w-3.5 h-3.5" />
            <span>Quick Demo Credentials</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@platform.local')}
              className="px-3 py-1.5 btn-glass text-slate-300 hover:text-cyan-300 text-[11px] font-mono-custom rounded-xl text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('issuer@vuniv.edu')}
              className="px-3 py-1.5 btn-glass text-slate-300 hover:text-cyan-300 text-[11px] font-mono-custom rounded-xl text-center"
            >
              Institution Issuer
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-glass-card border border-glass-rose rounded-2xl flex items-start space-x-2 text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In Form — Glassmorphism Inputs */}
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
                className="w-full bg-glass-input border border-glass focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-sans transition-all focus:ring-2 focus:ring-cyan-500/20 focus:glow-cyan"
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
                className="w-full bg-glass-input border border-glass focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-sans transition-all focus:ring-2 focus:ring-cyan-500/20 focus:glow-cyan"
              />
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 btn-futuristic rounded-xl text-xs flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
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
          <p className="text-[11px] text-slate-500 font-mono-custom">
            Secured by EVM Smart Contracts & IPFS Metadata Gateway
          </p>
        </div>
      </div>
    </div>
  );
};
