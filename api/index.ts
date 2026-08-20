import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health endpoint
  if (url.includes('/health')) {
    return res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
    });
  }

  // Auth login endpoint
  if (url.includes('/auth/login') && req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const email = (body.email || '').trim().toLowerCase();

    const isIssuer = email.includes('issuer') || email === 'issuer@vuniv.edu';

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken: isIssuer ? 'demo-jwt-issuer-token' : 'demo-jwt-admin-token',
        refreshToken: isIssuer ? 'demo-refresh-issuer-token' : 'demo-refresh-admin-token',
        user: {
          id: isIssuer ? 'user-issuer-001' : 'user-admin-001',
          email: email || (isIssuer ? 'issuer@vuniv.edu' : 'admin@platform.local'),
          firstName: isIssuer ? 'Institution' : 'Super',
          lastName: isIssuer ? 'Issuer' : 'Admin',
          fullName: isIssuer ? 'Shree Devi Institution Issuer' : 'Super Administrator',
          role: isIssuer ? 'INSTITUTION_ISSUER' : 'SUPER_ADMIN',
          institutionId: 'inst-shreedevi-001',
        },
      },
    });
  }

  // Auth me endpoint
  if (url.includes('/auth/me')) {
    return res.status(200).json({
      success: true,
      data: {
        id: 'user-issuer-001',
        email: 'issuer@vuniv.edu',
        firstName: 'Institution',
        lastName: 'Issuer',
        fullName: 'Shree Devi Institution Issuer',
        role: 'INSTITUTION_ISSUER',
        institutionId: 'inst-shreedevi-001',
      },
    });
  }

  // Default API response
  return res.status(200).json({
    success: true,
    message: 'CertTrust EVM Serverless API Online',
    timestamp: new Date().toISOString(),
  });
}
