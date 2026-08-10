// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IAcademicCertificate
 * @notice Interface for the Academic Certificate Verification Smart Contract
 */
interface IAcademicCertificate {
    struct CertificateRecord {
        bytes32 canonicalHash;
        string ipfsCid;
        address issuer;
        uint256 issueTimestamp;
        bool isRevoked;
        string revocationReason;
    }

    event CertificateIssued(
        bytes32 indexed canonicalHash,
        string ipfsCid,
        address indexed issuer,
        uint256 timestamp
    );

    event CertificateRevoked(
        bytes32 indexed canonicalHash,
        address indexed revoker,
        string reason,
        uint256 timestamp
    );

    error CertificateAlreadyExists(bytes32 canonicalHash);
    error CertificateNotFound(bytes32 canonicalHash);
    error CertificateAlreadyRevoked(bytes32 canonicalHash);
    error EmptyIpfsCid();
    error EmptyRevocationReason();
    error ZeroHashNotAllowed();

    function issueCertificate(bytes32 canonicalHash, string calldata ipfsCid) external;
    function revokeCertificate(bytes32 canonicalHash, string calldata reason) external;
    function verifyCertificate(bytes32 canonicalHash) external view returns (bool isValid, bool isRevoked, string memory ipfsCid, address issuer, uint256 issueTimestamp);
    function getCertificate(bytes32 canonicalHash) external view returns (CertificateRecord memory);
    function totalCertificatesCount() external view returns (uint256);
}
