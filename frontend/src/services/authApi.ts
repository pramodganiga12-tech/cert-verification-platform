import { ApiResponse } from '../types/verification';
import { UserProfile } from '../context/AuthContext';

const API_BASE_URL = '/api';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export class AuthApiService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const text = await res.text();
    let payload: any = {};
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || 'Unexpected server response'}`);
    }

    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Login failed. Please check credentials.');
    }
    return payload.data;
  }

  static async me(token: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();
    let payload: any = {};
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || 'Unexpected server response'}`);
    }

    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to fetch user profile');
    }
    return payload.data;
  }
}
