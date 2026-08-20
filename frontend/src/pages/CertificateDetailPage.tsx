import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BlockchainScene3D } from '../components/3d/BlockchainScene3D';
import { CertificateCard3D } from '../components/3d/CertificateCard3D';
import { ShieldCheck, Cpu, ExternalLink, Printer, ArrowLeft, Copy, Check, Lock, Calendar, User, Award, Layers } from 'lucide-react';
import { CertificateRecordUI } from '../services/adminApi';

export const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState<boolean>(false);
  const [cert, setCert] = useState<CertificateRecordUI | null>(null);

  useEffect(() => {
    // Default demo certificate details for Shree Devi Institute of Technology
    setCert({
      id: id || 'cert-001',
      certificate_number: id || 'CERT-2026-VUNIV-A1667359',
      institution_id: 'inst-shreedevi-001',
      student_id: 'STUD-100201',
      program_name: 'Computer Science & Engineering',
      degree: 'BACHELOR_OF_ENGINEERING',
      grade: 'FIRST_CLASS_WITH_DISTINCTION',
      issue_date: '2026-05-15',
      canonical_hash: '5f604d1fa9f54748911b1509c1f949ef036db653cec54538ac1ebd2076ff4014',
      ipfs_cid: 'QmQmNwtWshVV3vx6WuQeucP74gPuvnD68EvcmMvG7m4Z5k',
      status: 'ISSUED',
      revocation_reason: null,
      revoked_at: null,
      created_at: new Date().toISOString(),
    });
  }, [id]);

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cert) return null;

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      <BlockchainScene3D />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10 font-mono-custom">
        {/* Back Link Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Verification Engine</span>
          </Link>

          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-heading font-bold uppercase rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Ledger Status: Authentic & Verified</span>
          </div>
        </div>

        {/* 2-Column Detail View: 3D Viewer Left + Metadata & Timeline Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: 3D Certificate Viewer */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Interactive 3D Certificate Model
            </h3>
            <CertificateCard3D
              certificateNumber={cert.certificate_number}
              studentName="Rahul Verma"
              programName={cert.program_name}
              degree={cert.degree}
              issueDate={cert.issue_date}
              sha256Hash={cert.canonical_hash}
            />
          </div>

          {/* Right: Metadata Panel & Animated Audit Timeline */}
          <div className="lg:col-span-7 space-y-8">
            {/* Metadata Panel */}
            <div className="bg-glass-card border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 uppercase">
                    {cert.certificate_number}
                  </span>
                  <h2 className="text-xl font-heading font-bold text-white mt-1">
                    {cert.program_name}
                  </h2>
                </div>

                <button
                  onClick={() => copyHash(cert.canonical_hash)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5 text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
                </button>
              </div>

              {/* Grid Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Student Identifier / USN</span>
                  <p className="text-slate-200 font-bold">{cert.student_id}</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Institution Name</span>
                  <p className="text-cyan-400 font-bold">Shree Devi Institute of Technology</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Degree Program</span>
                  <p className="text-slate-200 font-bold">{cert.degree}</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Issue Date</span>
                  <p className="text-slate-200 font-bold">{cert.issue_date}</p>
                </div>
              </div>

              {/* Cryptographic Hash Digests */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/20 space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Canonical SHA-256 Hash Digest</span>
                  </span>
                  <p className="text-xs text-cyan-300 font-bold break-all mt-1">
                    {cert.canonical_hash}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">IPFS Gateway CID</span>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center space-x-1"
                  >
                    <span>{cert.ipfs_cid?.slice(0, 16)}...</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Visual Blockchain Audit Trail Timeline */}
            <div className="bg-glass-card border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Blockchain Audit Trail Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 border-l-2 border-cyan-500/30">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-cyan-500 border-4 border-[#05070d]" />
                  <p className="text-xs font-bold text-white">Certificate Created & Hash Computed</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">SHA-256 computed via canonical JSON payload normalization</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-violet-500 border-4 border-[#05070d]" />
                  <p className="text-xs font-bold text-white">IPFS Document Pinning</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Metadata CID pinned to Pinata IPFS Gateway</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-400 border-4 border-[#05070d]" />
                  <p className="text-xs font-bold text-emerald-400">On-Chain EVM Smart Contract Notarization</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Transaction <code className="text-cyan-300 font-bold">0x9d4a...8f21</code> mined into block #184920</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
