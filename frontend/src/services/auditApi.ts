export interface AuditLogItem {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}

export interface VerificationAnalyticsPayload {
  counts: {
    total: number;
    verified: number;
    tampered: number;
    revoked: number;
    notFound: number;
  };
  byMethod: {
    certificateId: number;
    qrCode: number;
    fileUpload: number;
  };
  recentLogs: any[];
}

export class AuditApiService {
  static async getAuditLogs(token: string): Promise<AuditLogItem[]> {
    const res = await fetch('/api/audit-logs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch audit logs');
    }
    return json.data;
  }

  static async getVerificationAnalytics(token: string): Promise<VerificationAnalyticsPayload> {
    const res = await fetch('/api/audit-logs/analytics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch verification analytics');
    }
    return json.data;
  }
}
