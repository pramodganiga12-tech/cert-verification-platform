import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_change_in_production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CERTIFICATE_ENCRYPTION_KEY: process.env.CERTIFICATE_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  DATABASE_PATH: process.env.DATABASE_PATH || './database/platform.sqlite',
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
  BLOCKCHAIN_PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  IPFS_API_URL: process.env.IPFS_API_URL || 'http://127.0.0.1:5001',
  IPFS_GATEWAY_URL: process.env.IPFS_GATEWAY_URL || 'http://127.0.0.1:8080',
};

