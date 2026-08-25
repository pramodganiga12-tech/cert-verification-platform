import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Award, PlusCircle, Users, LogOut, ArrowLeft, Building, FileText, CheckCircle2, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BlockchainScene3D } from './3d/BlockchainScene3D';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: 'overview' | 'certificates' | 'students' | 'audit' | 'verify';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'certificates', label: 'Certificate Registry', icon: Award, path: '/dashboard/certificates' },
    { id: 'verify', label: 'Verify Certificate', icon: CheckCircle2, path: '/dashboard/verify' },
    { id: 'students', label: 'Student Directory', icon: Users, path: '/dashboard/students' },
    { id: 'audit', label: 'System Audit Logs', icon: FileText, path: '/dashboard/audit' },
  ];

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Persistent 3D WebGL Background */}
      <BlockchainScene3D />

      {/* Glassmorphism Sidebar */}
      <aside className="w-64 bg-glass-sidebar border-r border-glass flex flex-col justify-between p-4 shrink-0 relative z-10">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-sky-500 to-violet-600 rounded-2xl shadow-xl shadow-cyan-500/20 text-white ring-2 ring-cyan-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-heading font-bold text-white block tracking-wide">CertTrust EVM</span>
              <span className="text-[10px] text-cyan-400 font-mono-custom">Institution Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-glass-card border border-cyan-500/30 text-cyan-300 shadow-lg glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          {/* Engine Status */}
          <div className="flex items-center space-x-2 px-3 py-2 text-[11px] font-mono-custom text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Engine:</span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>

          <div className="p-3 bg-glass-card rounded-2xl border border-glass space-y-1">
            <p className="text-xs font-bold text-slate-200 truncate">
              {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            <div className="mt-1 inline-block px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] rounded-lg font-mono-custom font-bold border border-cyan-500/20">
              {user?.role}
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-cyan-400 text-xs font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Verification</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
