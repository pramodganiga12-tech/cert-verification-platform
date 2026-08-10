import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { Logger } from '../utils/logger.js';
import { canonicalizeJSON } from '../utils/canonicalize.js';

export interface IpfsAddResult {
  cid: string;
  size: number;
  mode: 'DAEMON' | 'FALLBACK';
}

function computeFallbackCID(content: Buffer): string {
  const hashHex = crypto.createHash('sha256').update(content).digest('hex');
  // Base58 alphabet for multihash representation
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let num = BigInt('0x1220' + hashHex); // 0x12 = sha2-256, 0x20 = 32 bytes length
  let encoded = '';
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    encoded = ALPHABET[remainder] + encoded;
  }
  return `Qm${encoded.substring(0, 44)}`;
}

export class IpfsService {
  private static getFallbackStorageDir(): string {
    const storageDir = path.resolve(__dirname, '../../../database/ipfs_storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    return storageDir;
  }

  static async checkNodeHealth(): Promise<{ online: boolean; mode: 'DAEMON' | 'FALLBACK'; version?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${env.IPFS_API_URL}/api/v0/version`, {
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const body = (await res.json()) as { Version: string };
        return { online: true, mode: 'DAEMON', version: body.Version };
      }
    } catch {
      // IPFS daemon is not running locally
    }

    return { online: false, mode: 'FALLBACK' };
  }

  static async uploadBuffer(buffer: Buffer, _filename = 'file.bin'): Promise<IpfsAddResult> {
    const health = await this.checkNodeHealth();

    if (health.online) {
      try {
        const formData = new FormData();
        const blob = new Blob([buffer]);
        formData.append('file', blob, _filename);

        const res = await fetch(`${env.IPFS_API_URL}/api/v0/add?pin=true`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const body = (await res.json()) as { Hash: string; Size: string };
          Logger.info(`[IPFS] Uploaded to local daemon CID: ${body.Hash}`);
          return {
            cid: body.Hash,
            size: parseInt(body.Size, 10),
            mode: 'DAEMON',
          };
        }
      } catch (err) {
        Logger.warn('[IPFS] Daemon upload failed, falling back to local IPFS storage:', err);
      }
    }

    // Fallback mode
    const cid = computeFallbackCID(buffer);
    const filePath = path.join(this.getFallbackStorageDir(), cid);
    fs.writeFileSync(filePath, buffer);
    Logger.info(`[IPFS Fallback] Stored content locally with CID: ${cid}`);

    return {
      cid,
      size: buffer.length,
      mode: 'FALLBACK',
    };
  }

  static async uploadJSON(data: unknown): Promise<IpfsAddResult> {
    const jsonString = canonicalizeJSON(data);
    const buffer = Buffer.from(jsonString, 'utf8');
    return this.uploadBuffer(buffer, 'metadata.json');
  }

  static async retrieveContent(cid: string): Promise<Buffer> {
    const health = await this.checkNodeHealth();

    if (health.online) {
      try {
        const res = await fetch(`${env.IPFS_API_URL}/api/v0/cat?arg=${encodeURIComponent(cid)}`, {
          method: 'POST',
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      } catch (err) {
        Logger.warn(`[IPFS] Daemon retrieval for CID ${cid} failed, attempting local fallback store:`, err);
      }
    }

    // Retrieve from Fallback Storage
    const filePath = path.join(this.getFallbackStorageDir(), cid);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Content with IPFS CID '${cid}' not found in daemon or fallback store`);
    }

    return fs.readFileSync(filePath);
  }
}
