import React, { useState, useRef } from 'react';
import { ShieldCheck, Cpu, QrCode, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface CertificateCard3DProps {
  isScanning?: boolean;
  certificateNumber?: string;
  studentName?: string;
  programName?: string;
  degree?: string;
  issueDate?: string;
  sha256Hash?: string;
  institutionName?: string;
  status?: 'ISSUED' | 'REVOKED' | 'VALID';
}

export const CertificateCard3D: React.FC<CertificateCard3DProps> = ({
  isScanning = false,
  certificateNumber = 'CERT-2026-SDIT-884920',
  studentName = 'Rahul Verma',
  programName = 'Computer Science & Engineering',
  degree = 'BACHELOR_OF_ENGINEERING',
  issueDate = '2026-05-15',
  sha256Hash = '5f604d1fa9f54748911b1509c1f949ef036db653cec54538ac1ebd2076ff4014',
  institutionName = 'Shree Devi Institute of Technology',
  status = 'VALID',
}) => {
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: '1200px' }}
      className="w-full max-w-xl mx-auto py-4 cursor-pointer selection:bg-none"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: rotateX === 0 ? 'transform 0.5s ease-out' : 'none',
        }}
        className="bg-gradient-to-br from-slate-900/90 via-[#0d1324]/95 to-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden group hover:shadow-cyan-500/20 hover:border-cyan-400/60"
      >
        {/* Hologram Grid Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Laser Sweep Scanner Effect */}
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] animate-laser-scan z-30 pointer-events-none" />
        )}

        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-cyan-500/20 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono-custom text-cyan-400 font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {certificateNumber}
              </span>
              <h4 className="text-sm sm:text-base font-heading font-bold text-white mt-1">
                {institutionName}
              </h4>
            </div>
          </div>

          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card Body */}
        <div className="py-6 space-y-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] font-mono-custom text-slate-400 uppercase">Student Name</span>
            <p className="text-xl sm:text-2xl font-heading font-bold text-gradient-cyan tracking-wide">
              {studentName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-[11px] font-mono-custom text-slate-400 uppercase">Program / Major</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{programName}</p>
            </div>
            <div>
              <span className="text-[11px] font-mono-custom text-slate-400 uppercase">Degree Awarded</span>
              <p className="text-xs font-semibold text-cyan-400 mt-0.5">{degree}</p>
            </div>
          </div>
        </div>

        {/* Card Footer Hash & QR Notary */}
        <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-mono-custom text-slate-500 uppercase flex items-center space-x-1">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>SHA-256 Hash Digest</span>
            </span>
            <p className="text-[10px] font-mono-custom text-slate-400 truncate max-w-[240px]">
              {sha256Hash}
            </p>
          </div>

          <div className="p-2 bg-slate-900 rounded-xl border border-cyan-500/30 text-cyan-400">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
