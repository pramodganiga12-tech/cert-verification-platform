import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BlockchainScene3D } from '../components/3d/BlockchainScene3D';
import { Cpu, ShieldCheck, Layers, QrCode, Lock, ArrowRight, CheckCircle2, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Canonical Certificate Hashing',
      subtitle: 'SHA-256 Payload Normalization',
      description:
        'When Shree Devi Institute issues a degree certificate or transcript, its core metadata (Student USN, Degree, Issue Date, Program Name) is serialized into canonical JSON and hashed with SHA-256.',
      icon: Cpu,
      color: 'from-cyan-500 to-sky-600',
      badge: 'Cryptographic Hashing',
    },
    {
      step: '02',
      title: 'IPFS Storage & EVM Notarization',
      subtitle: 'Decentralized Immutable Ledger',
      description:
        'The normalized document payload is pinned to the Pinata IPFS Gateway. Simultaneously, the canonical SHA-256 hash digest is recorded on-chain in the AcademicCertificate EVM Smart Contract.',
      icon: Layers,
      color: 'from-violet-500 to-indigo-600',
      badge: 'Ganache EVM Contract',
    },
    {
      step: '03',
      title: 'Zero-Knowledge Public Verification',
      subtitle: 'Instant Cryptographic Validation',
      description:
        'Employers and universities can upload the original PDF certificate or scan its embedded QR code. The system recalculates the SHA-256 hash in real time and matches it against the EVM block ledger.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Zero-Knowledge Proof',
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      <BlockchainScene3D />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 relative z-10 font-mono-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-heading font-bold uppercase rounded-full tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Architecture Breakdown</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
            How Blockchain Certificate Verification Works
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
            A 3-phase cryptographic protocol delivering 100% tamper-proof academic credentials for Shree Devi Institute of Technology.
          </p>
        </div>

        {/* 3 Step Animated Cards */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden group hover:border-cyan-400/60"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-tr ${st.color} text-white shadow-xl`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 uppercase">
                        Phase {st.step} • {st.badge}
                      </span>
                      <h3 className="text-xl font-heading font-bold text-white mt-1">
                        {st.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-3xl font-heading font-extrabold text-cyan-500/30">
                    {st.step}
                  </span>
                </div>

                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  {st.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center pt-8">
          <a
            href="/"
            className="btn-futuristic px-8 py-4 rounded-2xl text-xs inline-flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Verification Engine</span>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};
