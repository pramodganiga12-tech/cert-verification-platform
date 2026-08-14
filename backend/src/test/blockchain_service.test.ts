import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BlockchainService } from '../services/BlockchainService.js';


describe('Blockchain Integration Service Unit Tests', () => {
  const blockchainService = new BlockchainService();
  const sampleHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const sampleCid = 'QmQmZ6JsWcJS5pHuSWX35sk7DEyjDZ8MvvVNiZU73kXLaV';

  it('checkNodeHealth should return connection health object', async () => {
    const health = await blockchainService.checkNodeHealth();
    assert.ok(health.rpcUrl);
    assert.ok(typeof health.isConnected === 'boolean');
  });

  it('issueCertificateOnChain should return confirmed transaction result', async () => {
    const res = await blockchainService.issueCertificateOnChain(sampleHash, sampleCid);
    assert.ok(res.txHash.startsWith('0x'));
    assert.strictEqual(res.status, 'CONFIRMED');
    assert.ok(res.blockNumber > 0);
  });

  it('verifyCertificateOnChain should return valid status for issued hash', async () => {
    const verifyRes = await blockchainService.verifyCertificateOnChain(sampleHash);
    assert.strictEqual(verifyRes.isValid, true);
    assert.strictEqual(verifyRes.isRevoked, false);
    assert.strictEqual(verifyRes.ipfsCid, sampleCid);
    assert.ok(verifyRes.issueTimestamp > 0);
  });

  it('revokeCertificateOnChain should revoke issued hash', async () => {
    const revokeRes = await blockchainService.revokeCertificateOnChain(sampleHash, 'Academic fraud detected');
    assert.ok(revokeRes.txHash.startsWith('0x'));
    assert.strictEqual(revokeRes.status, 'CONFIRMED');

    const verifyRes = await blockchainService.verifyCertificateOnChain(sampleHash);
    assert.strictEqual(verifyRes.isValid, false);
    assert.strictEqual(verifyRes.isRevoked, true);
  });

  it('verifyCertificateOnChain should return invalid for unissued hash', async () => {
    const unknownHash = '1111111111111111111111111111111111111111111111111111111111111111';
    const verifyRes = await blockchainService.verifyCertificateOnChain(unknownHash);
    assert.strictEqual(verifyRes.isValid, false);
    assert.strictEqual(verifyRes.isRevoked, false);
  });

  it('Invalid hash length should throw AppError INVALID_HASH', async () => {
    await assert.rejects(
      async () => {
        await blockchainService.verifyCertificateOnChain('short_hash');
      },
      (err: any) => {
        return err.errorCode === 'INVALID_HASH' && err.statusCode === 400;
      }
    );
  });
});
