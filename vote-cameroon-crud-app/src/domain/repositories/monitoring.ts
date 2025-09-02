// Monitoring and Statistics Repositories

import {
  HourlyTurnout,
  BureauAssignment,
  RolePermission,
  UserAssociation,
  AssignmentType,
  AssignmentStatus,
  AssociationType
} from '../entities/monitoring';

// Hourly Turnout Repository
export interface HourlyTurnoutRepository {
  findAll(): Promise<HourlyTurnout[]>;
  findById(id: number): Promise<HourlyTurnout | null>;
  findByPollingStation(pollingStationId: string): Promise<HourlyTurnout[]>;
  findByHour(hour: number): Promise<HourlyTurnout[]>;
  findByDate(date: Date): Promise<HourlyTurnout[]>;
  create(turnoutData: CreateHourlyTurnoutData): Promise<HourlyTurnout>;
  update(id: number, turnoutData: UpdateHourlyTurnoutData): Promise<HourlyTurnout>;
  delete(id: number): Promise<void>;
  getTurnoutTrend(pollingStationId: string, startHour: number, endHour: number): Promise<HourlyTurnout[]>;
}

// Bureau Assignment Repository
export interface BureauAssignmentRepository {
  findAll(): Promise<BureauAssignment[]>;
  findById(id: number): Promise<BureauAssignment | null>;
  findByUser(userId: string): Promise<BureauAssignment[]>;
  findByPollingStation(pollingStationId: string): Promise<BureauAssignment[]>;
  findByAssignmentType(type: AssignmentType): Promise<BureauAssignment[]>;
  findByStatus(status: AssignmentStatus): Promise<BureauAssignment[]>;
  findActiveAssignments(): Promise<BureauAssignment[]>;
  create(assignmentData: CreateBureauAssignmentData): Promise<BureauAssignment>;
  update(id: number, assignmentData: UpdateBureauAssignmentData): Promise<BureauAssignment>;
  delete(id: number): Promise<void>;
  deactivate(id: number): Promise<BureauAssignment>;
}

// Role Permission Repository
export interface RolePermissionRepository {
  findAll(): Promise<RolePermission[]>;
  findById(id: number): Promise<RolePermission | null>;
  findByRole(role: string): Promise<RolePermission[]>;
  findByPermission(permission: string): Promise<RolePermission[]>;
  create(permissionData: CreateRolePermissionData): Promise<RolePermission>;
  delete(id: number): Promise<void>;
  hasPermission(role: string, permission: string): Promise<boolean>;
  bulkCreate(permissions: CreateRolePermissionData[]): Promise<RolePermission[]>;
}

// User Association Repository
export interface UserAssociationRepository {
  findAll(): Promise<UserAssociation[]>;
  findById(id: number): Promise<UserAssociation | null>;
  findByUser(userId: string): Promise<UserAssociation[]>;
  findByRegion(regionId: number): Promise<UserAssociation[]>;
  findByDepartment(departmentId: number): Promise<UserAssociation[]>;
  findByCommune(communeId: number): Promise<UserAssociation[]>;
  findByPollingStation(pollingStationId: string): Promise<UserAssociation[]>;
  findByAssociationType(type: AssociationType): Promise<UserAssociation[]>;
  create(associationData: CreateUserAssociationData): Promise<UserAssociation>;
  update(id: number, associationData: UpdateUserAssociationData): Promise<UserAssociation>;
  delete(id: number): Promise<void>;
}

// DTOs for Monitoring and Statistics
export interface CreateHourlyTurnoutData {
  pollingStationId: string;
  hour: number;
  votersCount: number;
  recordedBy?: string;
}

export interface UpdateHourlyTurnoutData {
  votersCount?: number;
  turnoutRate?: number;
  recordedBy?: string;
}

export interface CreateBureauAssignmentData {
  userId: string;
  pollingStationId: string;
  assignedBy: string;
  assignmentType: AssignmentType;
  notes?: string;
}

export interface UpdateBureauAssignmentData {
  assignmentType?: AssignmentType;
  status?: AssignmentStatus;
  notes?: string;
}

export interface CreateRolePermissionData {
  role: string;
  permission: string;
}

export interface CreateUserAssociationData {
  userId: string;
  regionId?: number;
  departmentId?: number;
  communeId?: number;
  pollingStationId?: string;
  associationType: AssociationType;
}

export interface UpdateUserAssociationData {
  regionId?: number;
  departmentId?: number;
  communeId?: number;
  pollingStationId?: string;
  associationType?: AssociationType;
}
