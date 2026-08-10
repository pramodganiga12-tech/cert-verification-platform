// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAcademicCertificate.sol";

/**
 * @title AcademicCertificate
 * @notice Enterprise Smart Contract for Academic Certificate Notarization, Verification & Revocation.
 */
contract AcademicCertificate is IAcademicCertificate, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant REVOKER_ROLE = keccak256("REVOKER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Mapping from canonicalHash -> CertificateRecord
    mapping(bytes32 => CertificateRecord) private _certificates;

    // Array of issued certificate hashes for enumeration
    bytes32[] private _certificateHashes;

    constructor(address admin) {
        address initialAdmin = admin != address(0) ? admin : msg.sender;

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(ISSUER_ROLE, initialAdmin);
        _grantRole(REVOKER_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);
    }

    /**
     * @notice Issue a new certificate on-chain with its canonical hash and IPFS CID
     * @param canonicalHash SHA-256 canonical hash of the certificate
     * @param ipfsCid IPFS CID where full JSON metadata is stored
     */
    function issueCertificate(bytes32 canonicalHash, string calldata ipfsCid)
        external
        override
        onlyRole(ISSUER_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (canonicalHash == bytes32(0)) revert ZeroHashNotAllowed();
        if (bytes(ipfsCid).length == 0) revert EmptyIpfsCid();
        if (_certificates[canonicalHash].issueTimestamp != 0) {
            revert CertificateAlreadyExists(canonicalHash);
        }

        CertificateRecord memory cert = CertificateRecord({
            canonicalHash: canonicalHash,
            ipfsCid: ipfsCid,
            issuer: msg.sender,
            issueTimestamp: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        _certificates[canonicalHash] = cert;
        _certificateHashes.push(canonicalHash);

        emit CertificateIssued(canonicalHash, ipfsCid, msg.sender, block.timestamp);
    }

    /**
     * @notice Revoke an issued certificate
     * @param canonicalHash SHA-256 canonical hash of the certificate
     * @param reason Human-readable revocation rationale
     */
    function revokeCertificate(bytes32 canonicalHash, string calldata reason)
        external
        override
        onlyRole(REVOKER_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (canonicalHash == bytes32(0)) revert ZeroHashNotAllowed();
        if (bytes(reason).length == 0) revert EmptyRevocationReason();
        if (_certificates[canonicalHash].issueTimestamp == 0) {
            revert CertificateNotFound(canonicalHash);
        }
        if (_certificates[canonicalHash].isRevoked) {
            revert CertificateAlreadyRevoked(canonicalHash);
        }

        _certificates[canonicalHash].isRevoked = true;
        _certificates[canonicalHash].revocationReason = reason;

        emit CertificateRevoked(canonicalHash, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Public verification endpoint for any verifier
     * @param canonicalHash SHA-256 canonical hash to query
     */
    function verifyCertificate(bytes32 canonicalHash)
        external
        view
        override
        returns (
            bool isValid,
            bool isRevoked,
            string memory ipfsCid,
            address issuer,
            uint256 issueTimestamp
        )
    {
        CertificateRecord memory cert = _certificates[canonicalHash];
        if (cert.issueTimestamp == 0) {
            return (false, false, "", address(0), 0);
        }

        return (
            !cert.isRevoked,
            cert.isRevoked,
            cert.ipfsCid,
            cert.issuer,
            cert.issueTimestamp
        );
    }

    /**
     * @notice Fetch full certificate record details
     */
    function getCertificate(bytes32 canonicalHash)
        external
        view
        override
        returns (CertificateRecord memory)
    {
        if (_certificates[canonicalHash].issueTimestamp == 0) {
            revert CertificateNotFound(canonicalHash);
        }
        return _certificates[canonicalHash];
    }

    /**
     * @notice Returns total number of certificates notarized on-chain
     */
    function totalCertificatesCount() external view override returns (uint256) {
        return _certificateHashes.length;
    }

    /**
     * @notice Emergency pause contract functionality
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Resume contract functionality
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
