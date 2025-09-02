// Electoral Infrastructure Repositories

import { 
  VotingCenter, 
  PollingStationHierarchy,
  VotingCenterStatus 
} from '../entities/electoral-infrastructure';
import { PollingStationStatus } from '../entities';

// Voting Center Repository
export interface VotingCenterRepository {
  findAll(): Promise<VotingCenter[]>;
  findById(id: string): Promise<VotingCenter | null>;
  findByCommune(communeId: number): Promise<VotingCenter[]>;
  findByStatus(status: VotingCenterStatus): Promise<VotingCenter[]>;
  create(centerData: CreateVotingCenterData): Promise<VotingCenter>;
  update(id: string, centerData: UpdateVotingCenterData): Promise<VotingCenter>;
  delete(id: string): Promise<void>;
  findNearby(latitude: number, longitude: number, radiusKm: number): Promise<VotingCenter[]>;
}

// Polling Station Hierarchy Repository
export interface PollingStationHierarchyRepository {
  findAll(): Promise<PollingStationHierarchy[]>;
  findById(id: string): Promise<PollingStationHierarchy | null>;
  findByVotingCenter(votingCenterId: string): Promise<PollingStationHierarchy[]>;
  findByStatus(status: PollingStationStatus): Promise<PollingStationHierarchy[]>;
  create(stationData: CreatePollingStationHierarchyData): Promise<PollingStationHierarchy>;
  update(id: string, stationData: UpdatePollingStationHierarchyData): Promise<PollingStationHierarchy>;
  delete(id: string): Promise<void>;
  updateTurnoutRate(id: string, votesSubmitted: number): Promise<PollingStationHierarchy>;
}

// DTOs for Electoral Infrastructure
export interface CreateVotingCenterData {
  name: string;
  address: string;
  communeId: number;
  latitude?: number;
  longitude?: number;
  capacity: number;
  status?: VotingCenterStatus;
}

export interface UpdateVotingCenterData {
  name?: string;
  address?: string;
  communeId?: number;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  pollingStationsCount?: number;
  status?: VotingCenterStatus;
}

export interface CreatePollingStationHierarchyData {
  name: string;
  votingCenterId: string;
  stationNumber: number;
  registeredVoters: number;
  status?: PollingStationStatus;
}

export interface UpdatePollingStationHierarchyData {
  name?: string;
  votingCenterId?: string;
  stationNumber?: number;
  registeredVoters?: number;
  votesSubmitted?: number;
  status?: PollingStationStatus;
}
