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
          {/* Main Verification Platform Homepage */}
          <Route path="/" element={<PublicVerificationPage />} />

          {/* Public Verification Page */}
          <Route path="/verify" element={<PublicVerificationPage />} />

          {/* Student Credential Wallet & PDF Viewer */}
          <Route path="/wallet" element={<StudentWalletPage />} />

          {/* Institution Admin Portal Sign-In */}
          <Route path="/login" element={<LoginPage />} />

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

          {/* Catch-all Route redirects to Main Homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
