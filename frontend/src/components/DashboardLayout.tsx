import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Award, PlusCircle, Users, LogOut, ArrowLeft, Building, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-sky-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 backdrop-blur-xl">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-50 block">CertTrust EVM</span>
              <span className="text-[10px] text-sky-400 font-mono">Institution Portal</span>
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
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
            <p className="text-xs font-bold text-slate-200 truncate">
              {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            <div className="mt-1 inline-block px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] rounded font-mono font-semibold border border-sky-500/20">
              {user?.role}
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              className="w-full flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-sky-400 text-xs font-medium rounded-lg transition-colors"
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
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
