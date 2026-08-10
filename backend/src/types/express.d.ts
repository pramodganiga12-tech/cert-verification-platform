import { UserRecord } from '../repositories/UserRepository.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  institutionId: string | null;
  studentId: string | null;
  permissions: string[];
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
