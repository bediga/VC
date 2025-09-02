// Domain Entities - Pure business objects

// Re-export all entities from separate files
export * from './administrative';
export * from './electoral-infrastructure';
export * from './submissions';
export * from './monitoring';

// Core entities (keeping existing ones)
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  pollingStationId?: string;
  avatarPath?: string;
  region?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  phoneNumber?: string;
  mustChangePassword: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  party: string;
  age?: number;
  profession?: string;
  education?: string;
  experience?: string;
  email?: string;
  phone?: string;
  website?: string;
  isActive: boolean;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollingStation {
  id: string;
  name: string;
  address?: string;
  location: GeographicLocation;
  registeredVoters: number;
  status: PollingStationStatus;
  votesSubmitted: number;
  turnoutRate: number;
  personnel: StationPersonnel;
  createdAt: Date;
  updatedAt: Date;
}

export interface ElectionResult {
  id: number;
  candidateId: number;
  pollingStationId: string;
  votes: number;
  percentage: number;
  totalVotes: number;
  submittedAt: Date;
  verified: boolean;
  verificationNotes?: string;
}

// Value Objects
export interface GeographicLocation {
  region?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  latitude?: number;
  longitude?: number;
}

export interface StationPersonnel {
  scrutineersCount: number;
  observersCount: number;
}

// Enums
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  SCRUTINEER = 'scrutineer',
  CHECKER = 'checker',
  OBSERVER = 'observer'
}

export enum PollingStationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CLOSED = 'closed',
  RESULTS_SUBMITTED = 'results_submitted'
}

// Business Rules
export class UserBusinessRules {
  static canManageUsers(userRole: UserRole): boolean {
    return [UserRole.SUPERADMIN, UserRole.ADMIN].includes(userRole);
  }

  static canDeleteUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
    if (currentUserRole === UserRole.SUPERADMIN) return true;
    if (currentUserRole === UserRole.ADMIN && targetUserRole !== UserRole.SUPERADMIN) return true;
    return false;
  }

  static mustChangePassword(user: User): boolean {
    return user.mustChangePassword;
  }
}

export class ElectionBusinessRules {
  static canSubmitResults(userRole: UserRole): boolean {
    return [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SCRUTINEER].includes(userRole);
  }

  static canVerifyResults(userRole: UserRole): boolean {
    return [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CHECKER].includes(userRole);
  }

  static calculateTurnoutRate(votesSubmitted: number, registeredVoters: number): number {
    if (registeredVoters === 0) return 0;
    return Math.round((votesSubmitted / registeredVoters) * 100 * 100) / 100;
  }

  static calculatePercentage(candidateVotes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((candidateVotes / totalVotes) * 100 * 100) / 100;
  }
}
