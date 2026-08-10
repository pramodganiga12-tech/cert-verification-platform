import crypto from 'crypto';
import { UserRepository } from '../repositories/UserRepository.js';
import { SessionRepository } from '../repositories/SessionRepository.js';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UnauthorizedError, BadRequestError } from '../errors/AppError.js';
import { AuthUser } from '../types/express.js';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    institutionId: string | null;
    permissions: string[];
  };
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  static async login(
    email: string,
    pass: string,
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<LoginResult> {
    if (!email || !pass) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await UserRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is inactive or suspended');
    }

    const isMatch = await comparePassword(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const role = await RoleRepository.findById(user.role_id);
    const roleName = role ? role.id : 'GUEST';
    const permissions = await RoleRepository.getRolePermissions(user.role_id);

    // Create session
    const sessionId = crypto.randomUUID();
    const expiresAtSession = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await SessionRepository.create({
      id: sessionId,
      user_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAtSession,
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName,
      institutionId: user.institution_id,
      sessionId,
    });

    // Create refresh token
    const refreshTokenId = crypto.randomUUID();
    const expiresAtRefresh = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const refreshToken = signRefreshToken({
      userId: user.id,
      sessionId,
      tokenId: refreshTokenId,
    });

    await RefreshTokenRepository.create({
      id: refreshTokenId,
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      expires_at: expiresAtRefresh,
    });

    // Audit log entry
    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: user.id,
      action: 'USER_LOGIN',
      entity_type: 'USER',
      entity_id: user.id,
      ip_address: ipAddress || null,
      details: JSON.stringify({ email: user.email, role: roleName }),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: '24h',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: roleName,
        institutionId: user.institution_id,
        permissions,
      },
    };
  }

  static async refresh(refreshTokenStr: string, ipAddress?: string | null, _userAgent?: string | null): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshTokenStr) {
      throw new BadRequestError('Refresh token required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshTokenStr);
    const storedRt = await RefreshTokenRepository.findByTokenHash(tokenHash);
    if (!storedRt || storedRt.revoked || new Date(storedRt.expires_at) < new Date()) {
      throw new UnauthorizedError('Refresh token has been revoked or expired');
    }

    const session = await SessionRepository.findById(payload.sessionId);
    if (!session || new Date(session.expires_at) < new Date()) {
      throw new UnauthorizedError('Associated session is invalid');
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account is no longer active');
    }

    const role = await RoleRepository.findById(user.role_id);
    const roleName = role ? role.id : 'GUEST';

    // Revoke old refresh token (Token rotation)
    await RefreshTokenRepository.revoke(storedRt.id);

    // Issue new access token and refresh token
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName,
      institutionId: user.institution_id,
      sessionId: session.id,
    });

    const newRtId = crypto.randomUUID();
    const expiresAtRefresh = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      sessionId: session.id,
      tokenId: newRtId,
    });

    await RefreshTokenRepository.create({
      id: newRtId,
      user_id: user.id,
      token_hash: hashToken(newRefreshToken),
      expires_at: expiresAtRefresh,
    });

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: user.id,
      action: 'TOKEN_REFRESH',
      entity_type: 'USER',
      entity_id: user.id,
      ip_address: ipAddress || null,
      details: null,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(authUser: AuthUser): Promise<void> {
    await SessionRepository.invalidate(authUser.sessionId);
    await RefreshTokenRepository.revokeAllForUser(authUser.id);

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: authUser.id,
      action: 'USER_LOGOUT',
      entity_type: 'USER',
      entity_id: authUser.id,
      ip_address: null,
      details: null,
    });
  }

  static async getProfile(authUser: AuthUser) {
    const user = await UserRepository.findById(authUser.id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: authUser.roleName,
      institutionId: user.institution_id,
      permissions: authUser.permissions,
      status: user.status,
      createdAt: user.created_at,
    };
  }
}
