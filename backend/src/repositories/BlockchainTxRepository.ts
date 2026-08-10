import { getDb } from '../config/database.js';

export interface BlockchainTxRecord {
  id: string;
  certificate_id: string;
  tx_hash: string | null;
  action: 'ISSUE' | 'REVOKE' | 'UPDATE_STATUS';
  from_address: string;
  contract_address: string;
  block_number: number | null;
  gas_used: string | null;
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'REVOKED';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export class BlockchainTxRepository {
  static async findById(id: string): Promise<BlockchainTxRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM blockchain_transactions WHERE id = ?').get(id) as BlockchainTxRecord | undefined;
    return row || null;
  }

  static async findByTxHash(tx_hash: string): Promise<BlockchainTxRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM blockchain_transactions WHERE tx_hash = ?').get(tx_hash) as BlockchainTxRecord | undefined;
    return row || null;
  }

  static async create(tx: Omit<BlockchainTxRecord, 'created_at' | 'updated_at'>): Promise<BlockchainTxRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO blockchain_transactions (id, certificate_id, tx_hash, action, from_address, contract_address, block_number, gas_used, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(tx.id, tx.certificate_id, tx.tx_hash || null, tx.action, tx.from_address, tx.contract_address, tx.block_number || null, tx.gas_used || null, tx.status || 'PENDING', tx.error_message || null);
    const created = await this.findById(tx.id);
    return created!;
  }

  static async updateStatus(id: string, status: BlockchainTxRecord['status'], block_number?: number, tx_hash?: string, error_message?: string): Promise<boolean> {
    const db = await getDb();
    const result = db.prepare(`
      UPDATE blockchain_transactions
      SET status = ?,
          block_number = COALESCE(?, block_number),
          tx_hash = COALESCE(?, tx_hash),
          error_message = COALESCE(?, error_message),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, block_number || null, tx_hash || null, error_message || null, id);
    return result.changes > 0;
  }
}
