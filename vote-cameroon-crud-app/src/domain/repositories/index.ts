// Repository Interfaces - Define contracts without implementation details

// Re-export all repository interfaces from separate files
export * from './administrative';
export * from './electoral-infrastructure';
export * from './submissions';
export * from './monitoring';

// Core repositories (keeping existing ones)
import { User, Candidate, PollingStation, ElectionResult } from '../entities';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findByRole(role: string): Promise<User[]>;
}

export interface CandidateRepository {
  findAll(): Promise<Candidate[]>;
  findById(id: number): Promise<Candidate | null>;
  create(candidateData: CreateCandidateData): Promise<Candidate>;
  update(id: number, candidateData: UpdateCandidateData): Promise<Candidate>;
  delete(id: number): Promise<void>;
  findActiveOnly(): Promise<Candidate[]>;
  findByParty(party: string): Promise<Candidate[]>;
  findByNameAndPosition(name: string, party: string): Promise<Candidate | null>;
}

export interface PollingStationRepository {
  findAll(): Promise<PollingStation[]>;
  findById(id: string): Promise<PollingStation | null>;
  create(stationData: CreatePollingStationData): Promise<PollingStation>;
  update(id: string, stationData: UpdatePollingStationData): Promise<PollingStation>;
  delete(id: string): Promise<void>;
  findByRegion(region: string): Promise<PollingStation[]>;
  findByStatus(status: string): Promise<PollingStation[]>;
}

export interface ElectionResultRepository {
  findAll(): Promise<ElectionResult[]>;
  findByCandidate(candidateId: number): Promise<ElectionResult[]>;
  findByPollingStation(stationId: string): Promise<ElectionResult[]>;
  create(resultData: CreateElectionResultData): Promise<ElectionResult>;
  update(id: number, resultData: UpdateElectionResultData): Promise<ElectionResult>;
  findWithDetails(): Promise<ElectionResultWithDetails[]>;
}

// Data Transfer Objects
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  region?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  region?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface CreateCandidateData {
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
}

export interface UpdateCandidateData {
  firstName?: string;
  lastName?: string;
  party?: string;
  age?: number;
  profession?: string;
  education?: string;
  experience?: string;
  email?: string;
  phone?: string;
  website?: string;
  isActive?: boolean;
}

export interface CreatePollingStationData {
  name: string;
  region?: string;
  department?: string;
  commune?: string;
  arrondissement?: string;
  address?: string;
  registeredVoters: number;
  latitude?: number;
  longitude?: number;
  status: string;
}

export interface UpdatePollingStationData {
  name?: string;
  region?: string;
  department?: string;
  commune?: string;
  arrondissement?: string;
  address?: string;
  registeredVoters?: number;
  latitude?: number;
  longitude?: number;
  status?: string;
}

export interface CreateElectionResultData {
  candidateId: number;
  pollingStationId: string;
  votes: number;
  totalVotes: number;
  verified?: boolean;
  verificationNotes?: string;
}

export interface UpdateElectionResultData {
  votes?: number;
  totalVotes?: number;
  verified?: boolean;
  verificationNotes?: string;
}

export interface ElectionResultWithDetails {
  id: number;
  candidateId: number;
  pollingStationId: string;
  votes: number;
  percentage: number;
  totalVotes: number;
  submittedAt: Date;
  verified: boolean;
  candidateName: string;
  candidateParty: string;
  pollingStationName: string;
  pollingStationRegion: string;
}
