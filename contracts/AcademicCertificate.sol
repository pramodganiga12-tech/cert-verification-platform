// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AcademicCertificate
 * @notice Foundation contract for academic certificate issuance and verification.
 */
contract AcademicCertificate is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct CertificateRecord {
        bytes32 certificateHash;
        string ipfsCid;
        address issuer;
        uint256 issueTimestamp;
        bool isRevoked;
        uint256 revocationTimestamp;
    }

    // Mapping from Certificate ID hash to Certificate Record
    mapping(bytes32 => CertificateRecord) public certificates;

    event CertificateIssued(
        bytes32 indexed certIdHash,
        bytes32 indexed certificateHash,
        string ipfsCid,
        address indexed issuer,
        uint256 issueTimestamp
    );

    event CertificateRevoked(
        bytes32 indexed certIdHash,
        address indexed revoker,
        uint256 revocationTimestamp,
        string reason
    );

    constructor(address rootAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, rootAdmin);
        _grantRole(ISSUER_ROLE, rootAdmin);
    }
}
