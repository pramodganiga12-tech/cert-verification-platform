import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipHits = new Map<string, RateLimitRecord>();

export function createRateLimiter(options: { windowMs: number; maxHits: number }) {
  const { windowMs, maxHits } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = ipHits.get(ip);
    if (!record || now > record.resetTime) {
      ipHits.set(ip, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxHits.toString());
      res.setHeader('X-RateLimit-Remaining', (maxHits - 1).toString());
      return next();
    }

    if (record.count >= maxHits) {
      res.setHeader('X-RateLimit-Limit', maxHits.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString());
      ApiResponse.error(res, 'Too many requests, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
      return;
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', maxHits.toString());
    res.setHeader('X-RateLimit-Remaining', (maxHits - record.count).toString());
    next();
  };
}

export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxHits: 200, // Max 200 requests per IP per 15 min
});
