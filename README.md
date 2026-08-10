# Blockchain-Based Academic Certificate Verification & Digital Credential Management Platform

A production-grade, privacy-preserving digital credential issuance and verification platform using Ethereum Smart Contracts, Local IPFS, AES-256-GCM encryption, and SQLite.

## Core Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, SQLite, AES-256-GCM, Helmet, CORS
- **Blockchain**: Solidity 0.8.24, Hardhat, Ganache, OpenZeppelin AccessControl, Ethers.js
- **Storage**: Local IPFS node

## Project Structure
```
cert-verification-platform/
├── .github/workflows/       # GitHub Actions CI
├── assets/                  # Logos and certificate templates
├── backend/                 # Node.js + Express + TypeScript server
├── blockchain/              # Hardhat smart contracts workspace
├── config/                  # Global environment & shared configs
├── contracts/               # Solidity smart contracts
├── database/                # SQLite migrations, seed scripts, schemas
├── diagrams/                # Mermaid architecture & sequence diagrams
├── docs/                    # Architectural & API documentation
├── frontend/                # Vite + React + TypeScript + Tailwind UI
├── presentation/            # Presentation slide decks and viva QA
├── scripts/                 # Root orchestration scripts
└── tests/                   # Cross-module E2E test suites
```

## Quick Start & Verification (Phase 1)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Type Check & Linting
```bash
npm run typecheck
npm run lint
```

### 3. Build All Modules
```bash
npm run build
```

### 4. Run Development Servers
Backend (Port 5000):
```bash
npm run dev:backend
```

Frontend (Port 3000):
```bash
npm run dev:frontend
```
