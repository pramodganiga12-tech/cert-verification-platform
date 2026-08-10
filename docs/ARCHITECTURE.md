# Comprehensive System Architecture Specification

## Architectural Overview

The **Blockchain-Based Academic Certificate Verification & Digital Credential Management Platform** is a multi-tier, decentralized-backed platform engineered for immutable credential issuing and instant verification without central authority reliance.

### Layer Specifications

1. **Frontend Presentation Layer**:
   - Framework: React 18 with TypeScript & Vite.
   - Styling: Tailwind CSS & Lucide icons.
   - State Management: Zustand & React Query.
   - Responsiveness & Accessibility: Light/Dark mode, WCAG compliant contrast ratios.

2. **Backend Application Layer**:
   - Runtime: Node.js with Express & TypeScript.
   - Authentication & Access Control: JWT tokens, refresh tokens, role-based access control (ADMIN, INSTITUTION, STUDENT, VERIFIER, GUEST).
   - Security: AES-256-GCM artifact encryption, Helmet HTTP headers, CORS policies, rate limiting, request validation.

3. **Decentralized Storage Layer**:
   - Technology: Local IPFS node.
   - Purpose: Off-chain storage of encrypted PDF artifacts identified by cryptographic CIDs.

4. **Blockchain Immutable Ledger Layer**:
   - Smart Contract Language: Solidity 0.8.24 with OpenZeppelin AccessControl.
   - Execution Node: Hardhat / Ganache local Ethereum node.
   - Client Interop: Ethers.js v6.

5. **Local Persistence Layer**:
   - Technology: SQLite Database.
   - Purpose: Fast indexing of user profiles, institutions, audit logs, verification logs, and transaction status metadata.

## Core Diagrams

### System Architecture
```mermaid
graph TB
    subgraph Client Layer
        U1[Admin / Institution / Student]
        U2[Public Verifier / Guest]
        FE[React + TypeScript + Vite Frontend App]
    end

    subgraph Application & Gateway Layer
        API[Express TypeScript API Server]
        AUTH[JWT & RBAC Middleware]
        SEC[AES-256-GCM Encryption Engine]
        PDF[PDF & QR Generator]
        HASH[SHA-256 / Keccak-256 Hasher]
    end

    subgraph Data & Storage Layer
        DB[(SQLite Local Database)]
        IPFS[(Local IPFS Node)]
    end

    subgraph Blockchain & Consensus Layer
        HARDHAT[Ethereum Local Node / Ganache]
        SC[AcademicCertificate Smart Contract]
    end

    U1 --> FE
    U2 --> FE
    FE --> API
    API --> AUTH
    API --> SEC
    API --> PDF
    API --> HASH
    API --> DB
    API --> IPFS
    API --> HARDHAT
    HARDHAT --> SC
```

### Component Architecture
```mermaid
graph TD
    subgraph Frontend Components
        RTR[React Router]
        ZUST[Zustand Auth & App State]
        RQ[React Query API Cache]
        PAGES[Role Dashboards & Public Verification Page]
    end

    subgraph Backend Modules
        CTRL[Controllers: Auth, Inst, Cert, Verify]
        SVC[Services: CertEngine, IPFS, Blockchain, Crypto]
        REPO[Repository / Data Access Layer]
    end

    subgraph External Interfaces
        CONTRACT_ETH[Ethers.js Contract Wrapper]
        IPFS_CLIENT[IPFS HTTP Client]
        SQLITE_CLIENT[SQLite Database Connection]
    end

    PAGES --> ZUST
    PAGES --> RQ
    RQ --> CTRL
    CTRL --> SVC
    SVC --> REPO
    SVC --> CONTRACT_ETH
    SVC --> IPFS_CLIENT
    REPO --> SQLITE_CLIENT
```

### Certificate Issuance Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Inst as Institution User
    participant App as Backend API Server
    participant Hash as Hashing Engine (Keccak/SHA)
    participant PDF as PDF & QR Generator
    participant Enc as AES-256-GCM Encryptor
    participant IPFS as Local IPFS Node
    participant BC as Smart Contract (Ganache)
    participant DB as SQLite DB

    Inst->>App: Submit Certificate Issuance Request
    App->>Hash: Generate Canonical Payload & Primary Verification Hash
    App->>PDF: Render Visual PDF Certificate with QR reference
    App->>Enc: Encrypt Certificate PDF artifact via AES-256-GCM
    App->>IPFS: Upload Encrypted Artifact to Local IPFS
    IPFS-->>App: Return IPFS CID
    App->>BC: Invoke issueCertificate(certIdHash, certHash, ipfsCid)
    BC-->>App: Return Transaction Hash & Block Number
    App->>DB: Save Certificate Record, CID, Hash, & Transaction log
    App-->>Inst: Return Final Verified Digital Certificate
```

### Verification Workflow
```mermaid
flowchart TD
    A[Verifier inputs Cert ID / Scans QR / Uploads PDF] --> B{Input Type?}
    
    B -- Cert ID / QR --> C[Query Database & Smart Contract]
    B -- Uploaded PDF --> D[Extract / Re-calculate Canonical Verification Hash]
    
    D --> C
    
    C --> E{Record Exists on Blockchain?}
    E -- No --> F[Result: NOT FOUND]
    E -- Yes --> G{Is Certificate Revoked?}
    
    G -- Yes --> H[Result: REVOKED]
    G -- No --> I{Calculated Hash matches On-Chain Hash?}
    
    I -- No --> J[Result: TAMPERED]
    I -- Yes --> K[Result: VERIFIED]
    
    F --> L[Log Verification Result in Audit Log]
    H --> L
    J --> L
    K --> L
```
