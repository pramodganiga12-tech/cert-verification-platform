import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { SessionRepository } from '../repositories/SessionRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { AuthUser } from '../types/express.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedError('Invalid bearer token format');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    // Check session validity in SQLite
    const session = await SessionRepository.findById(payload.sessionId);
    if (!session || new Date(session.expires_at) < new Date()) {
      throw new UnauthorizedError('Session has expired or been invalidated');
    }

    // Check user status
    const user = await UserRepository.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account is inactive or disabled');
    }

    // Fetch user permissions
    const permissions = await RoleRepository.getRolePermissions(user.role_id);
    const role = await RoleRepository.findById(user.role_id);
    const roleName = role ? role.id : 'GUEST';

    // Fetch student ID if applicable
    let studentId: string | null = null;
    if (roleName === 'STUDENT') {
      const student = await StudentRepository.findByIdentifier(user.institution_id || '', user.id);
      if (student) {
        studentId = student.id;
      }
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName,
      institutionId: user.institution_id,
      studentId,
      permissions,
      sessionId: session.id,
    };

    req.user = authUser;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.roleName;
    const allowed = new Set<string>();

    for (const r of roles) {
      allowed.add(r);
      if (r === 'ADMIN') {
        allowed.add('SUPER_ADMIN');
      }
      if (r === 'INSTITUTION') {
        allowed.add('SUPER_ADMIN');
        allowed.add('ADMIN');
        allowed.add('INSTITUTION_ADMIN');
        allowed.add('ISSUER');
        allowed.add('REVOKER');
      }
    }

    if (!allowed.has(userRole)) {
      return next(new ForbiddenError(`Access denied. Requires one of roles: ${roles.join(', ')}`));
    }

    next();
  };
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const hasAll = permissions.every((p) => req.user!.permissions.includes(p));
    if (!hasAll) {
      return next(new ForbiddenError(`Access denied. Missing required permissions: ${permissions.join(', ')}`));
    }

    next();
  };
}
