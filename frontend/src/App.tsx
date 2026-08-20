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
import { CertificateDetailPage } from './pages/CertificateDetailPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PageTransition } from './components/animation/PageTransition';

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
        <PageTransition>
          <Routes>
            {/* Main Verification Platform Landing & Scanner Page */}
            <Route path="/" element={<PublicVerificationPage />} />
            <Route path="/verify" element={<PublicVerificationPage />} />

            {/* Certificate Detail Page (3D Viewer & Audit Trail) */}
            <Route path="/detail" element={<CertificateDetailPage />} />
            <Route path="/detail/:id" element={<CertificateDetailPage />} />

            {/* How It Works Architecture Explainer */}
            <Route path="/how-it-works" element={<HowItWorksPage />} />

            {/* Student Credential Wallet & PDF Generator */}
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

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </AuthProvider>
  );
}
