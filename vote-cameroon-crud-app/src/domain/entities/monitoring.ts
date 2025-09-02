// Monitoring and Statistics Entities

export interface HourlyTurnout {
  id: number;
  pollingStationId: string;
  hour: number;
  votersCount: number;
  cumulativeCount: number;
  turnoutRate: number;
  recordedBy?: string;
  recordedAt: Date;
}

export interface BureauAssignment {
  id: number;
  userId: string;
  pollingStationId: string;
  assignedBy: string;
  assignmentType: AssignmentType;
  assignedAt: Date;
  status: AssignmentStatus;
  notes?: string;
}

export interface RolePermission {
  id: number;
  role: string;
  permission: string;
  createdAt: Date;
}

export interface UserAssociation {
  id: number;
  userId: string;
  regionId?: number;
  departmentId?: number;
  communeId?: number;
  pollingStationId?: string;
  associationType: AssociationType;
  createdAt: Date;
}

export enum AssignmentType {
  SCRUTINEER = 'scrutineer',
  OBSERVER = 'observer',
  SUPERVISOR = 'supervisor'
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed'
}

export enum AssociationType {
  OBSERVER = 'observer',
  SCRUTINEER = 'scrutineer',
  SUPERVISOR = 'supervisor'
}

// Business Rules pour le monitoring et les statistiques
export class MonitoringBusinessRules {
  static validateHourRange(hour: number): boolean {
    return hour >= 0 && hour <= 23;
  }

  static calculateCumulativeTurnout(hourlyData: HourlyTurnout[]): HourlyTurnout[] {
    let cumulative = 0;
    return hourlyData
      .sort((a, b) => a.hour - b.hour)
      .map(data => {
        cumulative += data.votersCount;
        return {
          ...data,
          cumulativeCount: cumulative
        };
      });
  }

  static canAssignUser(userRole: string, targetRole: string): boolean {
    const hierarchy: Record<string, string[]> = {
      'superadmin': ['superadmin', 'admin', 'scrutineer', 'checker', 'observer'],
      'admin': ['admin', 'scrutineer', 'checker', 'observer'],
      'scrutineer': ['observer'],
      'checker': ['observer'],
      'observer': []
    };

    return hierarchy[userRole]?.includes(targetRole) || false;
  }

  static getOptimalAssignmentCount(registeredVoters: number): { scrutineers: number; observers: number } {
    // Règle métier: 1 scrutateur pour 300 électeurs, 1 observateur pour 500 électeurs
    const scrutineers = Math.max(1, Math.ceil(registeredVoters / 300));
    const observers = Math.max(1, Math.ceil(registeredVoters / 500));
    
    return { scrutineers, observers };
  }

  static canRecordTurnout(userRole: string): boolean {
    return ['superadmin', 'admin', 'scrutineer', 'observer'].includes(userRole);
  }

  static isValidTurnoutTime(): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= 7 && currentHour <= 18; // Heures de vote: 7h-18h
  }

  static calculateTurnoutTrend(hourlyData: HourlyTurnout[]): 'increasing' | 'decreasing' | 'stable' {
    if (hourlyData.length < 2) return 'stable';
    
    const sorted = hourlyData.sort((a, b) => a.hour - b.hour);
    const lastTwo = sorted.slice(-2);
    
    if (lastTwo[1].votersCount > lastTwo[0].votersCount) return 'increasing';
    if (lastTwo[1].votersCount < lastTwo[0].votersCount) return 'decreasing';
    return 'stable';
  }
}
