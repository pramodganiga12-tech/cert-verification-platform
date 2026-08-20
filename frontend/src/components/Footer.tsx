import React from 'react';
import { ShieldCheck, Cpu, Globe, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-glass border-t border-white/10 mt-20 relative z-10 font-mono-custom text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-heading font-bold text-gradient-cyan">
                  Shree Devi Institute of Technology
                </h4>
                <p className="text-xs text-slate-400">
                  Kenjar, Mangaluru – 574142 • VTU & AICTE Approved
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Decentralized academic credential integrity platform. Anchors canonical PDF certificate hash digests to Ganache EVM smart contract ledgers with Pinata IPFS metadata gateways.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              System Navigation
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="/" className="hover:text-cyan-400 transition-colors">
                  Public Verification Gateway
                </a>
              </li>
              <li>
                <a href="/wallet" className="hover:text-cyan-400 transition-colors">
                  Student Credential Wallet
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-cyan-400 transition-colors">
                  Architecture & How It Works
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-cyan-400 transition-colors">
                  Institution Admin Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Department & Team Credits */}
          <div className="space-y-2">
            <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              Project Team (2026 - 2027)
            </h5>
            <p className="text-[11px] text-cyan-400 font-bold">
              Dept. of Computer Science & Engineering
            </p>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li>• Pramod M Gowdar</li>
              <li>• Manish Mestha</li>
              <li>• Lalithya G.K</li>
              <li>• Pradeep Shetty</li>
              <li className="pt-1 text-slate-300 font-semibold">• Guide: Ms. Amulya</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Ganache EVM Smart Contract: <code className="text-slate-300 font-bold">0x8f3C...4A91</code></span>
          </div>
          <p>© 2026 Shree Devi Institute of Technology. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
