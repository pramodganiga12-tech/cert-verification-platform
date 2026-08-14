import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { CertificateRegistryPage } from './pages/CertificateRegistryPage';
import { StudentRegistryPage } from './pages/StudentRegistryPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { StudentWalletPage } from './pages/StudentWalletPage';
import { PublicVerificationPage } from './pages/PublicVerificationPage';
import { InstitutionVerificationPage } from './pages/InstitutionVerificationPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Route renders Login Page */}
          <Route path="/" element={<LoginPage />} />

          {/* Admin & Institution Portal Sign-In */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student Credential Wallet & PDF Generator */}
          <Route path="/wallet" element={<StudentWalletPage />} />

          {/* Public Verification Portal */}
          <Route path="/verify" element={<PublicVerificationPage />} />

          {/* Protected Institution Admin Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/certificates"
            element={
              <ProtectedRoute>
                <CertificateRegistryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/verify"
            element={
              <ProtectedRoute>
                <InstitutionVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/students"
            element={
              <ProtectedRoute>
                <StudentRegistryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/audit"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
