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

  // Institutions endpoint
  if (url.includes('/institutions')) {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'inst-shreedevi-001',
          name: 'Shree Devi Institute of Technology',
          code: 'SDIT-VTU',
          email: 'info@sdit.ac.in',
          status: 'ACTIVE',
        },
      ],
    });
  }

  // Bulk import endpoint
  if (url.includes('/students/bulk-import') && req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'Bulk import successful',
      data: {
        totalProcessed: 5,
        totalSuccess: 5,
        totalFailed: 0,
        message: 'Successfully imported student profiles into directory.',
      },
    });
  }

  // Students endpoint
  if (url.includes('/students')) {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      return res.status(200).json({
        success: true,
        data: {
          id: `stud-${Date.now()}`,
          institution_id: body.institutionId || 'inst-shreedevi-001',
          student_identifier: body.studentIdentifier || `STUD-${Math.floor(100000 + Math.random() * 900000)}`,
          first_name: body.firstName || 'Alice',
          last_name: body.lastName || 'Verifier',
          email: body.email || 'alice@vuniv.edu',
          dob: body.dob || '2004-01-01',
          created_at: new Date().toISOString(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'stud-001',
          institution_id: 'inst-shreedevi-001',
          student_identifier: 'STUD-100201',
          first_name: 'Rahul',
          last_name: 'Verma',
          email: 'rahul.verma@sdit.ac.in',
          dob: '2004-08-15',
          created_at: new Date().toISOString(),
        },
        {
          id: 'stud-002',
          institution_id: 'inst-shreedevi-001',
          student_identifier: 'STUD-806179',
          first_name: 'Alice',
          last_name: 'Verifier',
          email: 'alice@vuniv.edu',
          dob: '2005-02-20',
          created_at: new Date().toISOString(),
        },
      ],
    });
  }

  // Certificates endpoint
  if (url.includes('/certificates')) {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'cert-001',
          certificate_number: 'CERT-2026-VUNIV-A1667359',
          institution_id: 'inst-shreedevi-001',
          student_id: 'stud-001',
          program_name: 'Computer Science & Engineering',
          degree: 'BACHELOR_OF_ENGINEERING',
          grade: 'FIRST_CLASS_WITH_DISTINCTION',
          issue_date: '2026-05-15',
          canonical_hash: '5f604d1fa9f54748911b1509c1f949ef036db653cec54538ac1ebd2076ff4014',
          ipfs_cid: 'QmQmNwtWshVV3vx6WuQeucP74gPuvnD68EvcmMvG7m4Z5k',
          status: 'ISSUED',
          revocation_reason: null,
          revoked_at: null,
          created_at: new Date().toISOString(),
        },
      ],
    });
  }

  // Default API response
  return res.status(200).json({
    success: true,
    message: 'CertTrust EVM Serverless API Online',
    timestamp: new Date().toISOString(),
  });
}
