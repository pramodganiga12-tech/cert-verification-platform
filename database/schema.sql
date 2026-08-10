-- ============================================================================
-- Blockchain Academic Certificate Verification Platform - Database Schema
-- SQLite Normalized DDL (15 Core Tables)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. ROLE_PERMISSIONS (Junction Table)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. INSTITUTIONS
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    address TEXT,
    wallet_address TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role_id TEXT NOT NULL,
    institution_id TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
);

-- 6. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    institution_id TEXT NOT NULL,
    student_identifier TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    dob TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
    UNIQUE(institution_id, student_identifier)
);

-- 7. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    certificate_number TEXT NOT NULL UNIQUE,
    institution_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    program_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    grade TEXT,
    issue_date TEXT NOT NULL,
    canonical_hash TEXT NOT NULL UNIQUE,
    pdf_hash TEXT,
    ipfs_cid TEXT,
    status TEXT NOT NULL DEFAULT 'ISSUED' CHECK(status IN ('ISSUED', 'REVOKED', 'SUSPENDED')),
    revocation_reason TEXT,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (institution_id) REFERENCES institutions(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 8. CERTIFICATE_VERSIONS
CREATE TABLE IF NOT EXISTS certificate_versions (
    id TEXT PRIMARY KEY,
    certificate_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    canonical_hash TEXT NOT NULL,
    pdf_hash TEXT,
    ipfs_cid TEXT,
    change_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(certificate_id, version)
);

-- 9. BLOCKCHAIN_TRANSACTIONS
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id TEXT PRIMARY KEY,
    certificate_id TEXT NOT NULL,
    tx_hash TEXT UNIQUE,
    action TEXT NOT NULL CHECK(action IN ('ISSUE', 'REVOKE', 'UPDATE_STATUS')),
    from_address TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    block_number INTEGER,
    gas_used TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED', 'REVOKED')),
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE
);

-- 10. VERIFICATION_LOGS
CREATE TABLE IF NOT EXISTS verification_logs (
    id TEXT PRIMARY KEY,
    certificate_id TEXT,
    verification_method TEXT NOT NULL CHECK(verification_method IN ('CERTIFICATE_ID', 'QR_CODE', 'FILE_UPLOAD')),
    result_status TEXT NOT NULL CHECK(result_status IN ('VERIFIED', 'TAMPERED', 'REVOKED', 'NOT_FOUND')),
    input_identifier TEXT,
    verified_by_user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    ip_address TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO' CHECK(type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR')),
    is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. REFRESH_TOKENS
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. SYSTEM_SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_institutions_code ON institutions(code);
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_identifier ON students(student_identifier);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_canonical_hash ON certificates(canonical_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_institution_id ON certificates(institution_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_cert_id ON blockchain_transactions(certificate_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_cert_id ON verification_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
