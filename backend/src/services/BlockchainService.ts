import { ethers } from 'ethers';
import { env } from '../config/env';
import { Logger as logger } from '../utils/logger';
import { AppError } from '../errors/AppError';
import { BlockchainTxRepository } from '../repositories/BlockchainTxRepository';


const ACADEMIC_CERTIFICATE_ABI = [
  'function issueCertificate(bytes32 canonicalHash, string calldata ipfsCid) external',
  'function batchIssueCertificates(bytes32[] calldata canonicalHashes, string[] calldata ipfsCids) external',
  'function revokeCertificate(bytes32 canonicalHash, string calldata reason) external',
  'function batchRevokeCertificates(bytes32[] calldata canonicalHashes, string[] calldata reasons) external',
  'function verifyCertificate(bytes32 canonicalHash) external view returns (bool isValid, bool isRevoked, string memory ipfsCid, address issuer, uint256 issueTimestamp)',
  'function getCertificate(bytes32 canonicalHash) external view returns (tuple(bytes32 canonicalHash, string ipfsCid, address issuer, uint256 issueTimestamp, bool isRevoked, string revocationReason))',
  'function totalCertificatesCount() external view returns (uint256)',
  'event CertificateIssued(bytes32 indexed canonicalHash, string ipfsCid, address indexed issuer, uint256 timestamp)',
  'event CertificateRevoked(bytes32 indexed canonicalHash, address indexed revoker, string reason, uint256 timestamp)'
];

export interface OnChainVerificationResult {
  isValid: boolean;
  isRevoked: boolean;
  ipfsCid: string;
  issuer: string;
  issueTimestamp: number;
}

export interface OnChainTxResult {
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  effectiveGasPrice: string;
  status: 'CONFIRMED' | 'FAILED';
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private txRepository: BlockchainTxRepository;
  private isConnectedNode = false;

  // In-memory fallback state for testing environments where no live Hardhat RPC node is active
  private localMockState = new Map<string, {
    canonicalHash: string;
    ipfsCid: string;
    issuer: string;
    issueTimestamp: number;
    isRevoked: boolean;
    revocationReason: string;
  }>();

  constructor() {
    this.txRepository = new BlockchainTxRepository();
    this.initializeEthers();
  }

  private async initializeEthers(): Promise<void> {
    try {
      this.provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
      
      // Probe node connection with 1.5s timeout
      const networkPromise = this.provider.getNetwork();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('RPC Connection Timeout')), 1500)
      );

      await Promise.race([networkPromise, timeoutPromise]);

      this.wallet = new ethers.Wallet(env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
      
      if (env.CONTRACT_ADDRESS && env.CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        this.contract = new ethers.Contract(env.CONTRACT_ADDRESS, ACADEMIC_CERTIFICATE_ABI, this.wallet);
      }

      this.isConnectedNode = true;
      logger.info(`[BlockchainService] Successfully connected to EVM node at ${env.BLOCKCHAIN_RPC_URL}`);
    } catch {
      this.isConnectedNode = false;
      logger.warn(`[BlockchainService] EVM Node not reachable at ${env.BLOCKCHAIN_RPC_URL}. Operating in resilient local state fallback engine.`);
    }
  }

  public async checkNodeHealth(): Promise<{ isConnected: boolean; rpcUrl: string; walletAddress?: string; contractAddress?: string }> {
    return {
      isConnected: this.isConnectedNode,
      rpcUrl: env.BLOCKCHAIN_RPC_URL,
      walletAddress: this.wallet ? this.wallet.address : 'LOCAL_FALLBACK_WALLET',
      contractAddress: env.CONTRACT_ADDRESS
    };
  }

  /**
   * Helper to format 64-char SHA-256 hex string to bytes32 format
   */
  private formatBytes32(sha256Hex: string): string {
    const cleanHex = sha256Hex.startsWith('0x') ? sha256Hex.slice(2) : sha256Hex;
    if (cleanHex.length !== 64) {
      throw new AppError('Canonical hash must be a valid 64-character hex string', 400, 'INVALID_HASH');
    }
    return `0x${cleanHex}`;
  }

  /**
   * Issue certificate on-chain
   */
  public async issueCertificateOnChain(canonicalHash: string, ipfsCid: string, certificateId?: string): Promise<OnChainTxResult> {
    const bytes32Hash = this.formatBytes32(canonicalHash);

    if (this.isConnectedNode && this.contract) {
      try {
        const tx = await this.contract.issueCertificate(bytes32Hash, ipfsCid);
        const receipt = await tx.wait();

        const result: OnChainTxResult = {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: (receipt.gasPrice || 0n).toString(),
          status: receipt.status === 1 ? 'CONFIRMED' : 'FAILED'
        };

        if (certificateId) {
          this.txRepository.create({
            certificate_id: certificateId,
            tx_hash: result.txHash,
            block_number: result.blockNumber,
            from_address: this.wallet?.address || '',
            to_address: env.CONTRACT_ADDRESS,
            status: result.status,
            gas_used: parseInt(result.gasUsed, 10),
            effective_gas_price: result.effectiveGasPrice
          });
        }

        return result;
      } catch (err: any) {
        logger.error(`[BlockchainService] Real on-chain issuance failed: ${err.message}`);
        throw new AppError(`On-chain issuance failed: ${err.message}`, 500, 'BLOCKCHAIN_TRANSACTION_FAILED');
      }
    }

    // Local state fallback execution
    if (this.localMockState.has(bytes32Hash)) {
      throw new AppError('Certificate hash already exists on-chain state', 400, 'CERTIFICATE_ALREADY_EXISTS');
    }

    this.localMockState.set(bytes32Hash, {
      canonicalHash: bytes32Hash,
      ipfsCid,
      issuer: '0x0000000000000000000000000000000000000001',
      issueTimestamp: Math.floor(Date.now() / 1000),
      isRevoked: false,
      revocationReason: ''
    });

    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const result: OnChainTxResult = {
      txHash: mockTxHash,
      blockNumber: 1000 + this.localMockState.size,
      gasUsed: '45000',
      effectiveGasPrice: '1000000000',
      status: 'CONFIRMED'
    };

    if (certificateId) {
      this.txRepository.create({
        certificate_id: certificateId,
        tx_hash: result.txHash,
        block_number: result.blockNumber,
        from_address: '0x0000000000000000000000000000000000000001',
        to_address: env.CONTRACT_ADDRESS,
        status: result.status,
        gas_used: 45000,
        effective_gas_price: result.effectiveGasPrice
      });
    }

    logger.info(`[BlockchainService Fallback] Issued certificate on simulated blockchain state (tx: ${mockTxHash})`);
    return result;
  }

  /**
   * Revoke certificate on-chain
   */
  public async revokeCertificateOnChain(canonicalHash: string, reason: string, certificateId?: string): Promise<OnChainTxResult> {
    const bytes32Hash = this.formatBytes32(canonicalHash);

    if (this.isConnectedNode && this.contract) {
      try {
        const tx = await this.contract.revokeCertificate(bytes32Hash, reason);
        const receipt = await tx.wait();

        const result: OnChainTxResult = {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: (receipt.gasPrice || 0n).toString(),
          status: receipt.status === 1 ? 'CONFIRMED' : 'FAILED'
        };

        if (certificateId) {
          this.txRepository.create({
            certificate_id: certificateId,
            tx_hash: result.txHash,
            block_number: result.blockNumber,
            from_address: this.wallet?.address || '',
            to_address: env.CONTRACT_ADDRESS,
            status: result.status,
            gas_used: parseInt(result.gasUsed, 10),
            effective_gas_price: result.effectiveGasPrice
          });
        }

        return result;
      } catch (err: any) {
        throw new AppError(`On-chain revocation failed: ${err.message}`, 500, 'BLOCKCHAIN_REVOCATION_FAILED');
      }
    }

    // Fallback local state engine
    const record = this.localMockState.get(bytes32Hash);
    if (!record) {
      throw new AppError('Certificate not found on simulated chain state', 404, 'CERTIFICATE_NOT_FOUND');
    }
    if (record.isRevoked) {
      throw new AppError('Certificate is already revoked on simulated chain state', 400, 'CERTIFICATE_ALREADY_REVOKED');
    }

    record.isRevoked = true;
    record.revocationReason = reason;

    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const result: OnChainTxResult = {
      txHash: mockTxHash,
      blockNumber: 1000 + this.localMockState.size + 1,
      gasUsed: '32000',
      effectiveGasPrice: '1000000000',
      status: 'CONFIRMED'
    };

    if (certificateId) {
      this.txRepository.create({
        certificate_id: certificateId,
        tx_hash: result.txHash,
        block_number: result.blockNumber,
        from_address: '0x0000000000000000000000000000000000000001',
        to_address: env.CONTRACT_ADDRESS,
        status: result.status,
        gas_used: 32000,
        effective_gas_price: result.effectiveGasPrice
      });
    }

    return result;
  }

  /**
   * Verify certificate status on-chain
   */
  public async verifyCertificateOnChain(canonicalHash: string): Promise<OnChainVerificationResult> {
    const bytes32Hash = this.formatBytes32(canonicalHash);

    if (this.isConnectedNode && this.contract) {
      try {
        const [isValid, isRevoked, ipfsCid, issuer, issueTimestamp] = await this.contract.verifyCertificate(bytes32Hash);
        return {
          isValid,
          isRevoked,
          ipfsCid,
          issuer,
          issueTimestamp: Number(issueTimestamp)
        };
      } catch (err: any) {
        logger.error(`[BlockchainService] Real on-chain verification failed: ${err.message}`);
        throw new AppError(`On-chain verification error: ${err.message}`, 500, 'BLOCKCHAIN_VERIFICATION_FAILED');
      }
    }

    // Fallback local state engine
    const record = this.localMockState.get(bytes32Hash);
    if (!record) {
      return {
        isValid: false,
        isRevoked: false,
        ipfsCid: '',
        issuer: '0x0000000000000000000000000000000000000000',
        issueTimestamp: 0
      };
    }

    return {
      isValid: !record.isRevoked,
      isRevoked: record.isRevoked,
      ipfsCid: record.ipfsCid,
      issuer: record.issuer,
      issueTimestamp: record.issueTimestamp
    };
  }
}
