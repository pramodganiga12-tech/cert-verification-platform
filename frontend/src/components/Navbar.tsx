import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Activity, QrCode, Award, Lock, BookOpen, Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Verify', path: '/', icon: QrCode },
    { label: 'Student Wallet', path: '/wallet', icon: Award },
    { label: 'How It Works', path: '/how-it-works', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-glass border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Institution Branding */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 via-sky-500 to-violet-600 rounded-2xl shadow-xl shadow-cyan-500/20 text-white group-hover:scale-105 transition-transform duration-300 ring-2 ring-cyan-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-heading font-extrabold tracking-wide text-gradient-cyan">
                  CertTrust EVM
                </span>
                <span className="text-[10px] font-mono-custom px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase">
                  Ganache EVM
                </span>
              </div>
              <p className="text-[11px] font-mono-custom text-slate-400">
                Shree Devi Institute of Technology
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <nav className="hidden lg:flex items-center space-x-1 font-mono-custom text-xs">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Live Engine Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono-custom px-3.5 py-2 bg-slate-900/90 border border-slate-800 text-slate-400 rounded-xl">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Engine:</span>
              <span className="text-emerald-400 font-bold flex items-center">
                Online
              </span>
            </div>

            {/* CTA Button */}
            <Link
              to="/login"
              className="btn-futuristic px-4 sm:px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Institution Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
