// Electoral Infrastructure Entities
import { PollingStationStatus } from './index';

export interface VotingCenter {
  id: string;
  name: string;
  address: string;
  communeId: number;
  latitude?: number;
  longitude?: number;
  capacity: number;
  pollingStationsCount: number;
  status: VotingCenterStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollingStationHierarchy {
  id: string;
  name: string;
  votingCenterId: string;
  stationNumber: number;
  registeredVoters: number;
  votesSubmitted: number;
  turnoutRate: number;
  status: PollingStationStatus;
  lastUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum VotingCenterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

// Business Rules pour l'infrastructure électorale
export class ElectoralInfrastructureBusinessRules {
  static calculateTurnoutRate(votesSubmitted: number, registeredVoters: number): number {
    if (registeredVoters === 0) return 0;
    return Math.round((votesSubmitted / registeredVoters) * 100 * 100) / 100;
  }

  static canClosePollingStation(station: PollingStationHierarchy): boolean {
    const currentHour = new Date().getHours();
    return currentHour >= 18; // Fermeture à 18h
  }

  static validateCapacity(pollingStationsCount: number, capacity: number): boolean {
    const averageCapacityPerStation = 600; // Capacité moyenne par bureau
    return pollingStationsCount * averageCapacityPerStation <= capacity;
  }

  static canAddPollingStation(center: VotingCenter, newStationCapacity: number = 600): boolean {
    return (center.pollingStationsCount + 1) * newStationCapacity <= center.capacity;
  }
}
