// Application Services - Orchestrate use cases and handle cross-cutting concerns
import { UserUseCases, CandidateUseCases, PollingStationUseCases, ElectionResultUseCases } from '../use-cases';
import { PollingStationStatus } from '../../domain/entities';
import { Either, left, right } from '../../shared/Result';

export interface ElectionManagementService {
  // Dashboard statistics
  getDashboardStats(): Promise<Either<Error, DashboardStats>>;
  
  // Election management operations
  startElection(): Promise<Either<Error, void>>;
  endElection(): Promise<Either<Error, void>>;
  getElectionStatus(): Promise<Either<Error, ElectionStatus>>;
}

export interface DashboardStats {
  totalUsers: number;
  totalCandidates: number;
  totalPollingStations: number;
  totalVotes: number;
  usersByRole: Record<string, number>;
  resultsByCandidate: Array<{
    candidateId: number;
    candidateName: string;
    party: string;
    totalVotes: number;
    percentage: number;
  }>;
  pollingStationStats: {
    active: number;
    inactive: number;
    setup: number;
  };
}

export interface ElectionStatus {
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
}

export class ElectionManagementServiceImpl implements ElectionManagementService {
  constructor(
    private userUseCases: UserUseCases,
    private candidateUseCases: CandidateUseCases,
    private pollingStationUseCases: PollingStationUseCases,
    private electionResultUseCases: ElectionResultUseCases
  ) {}

  async getDashboardStats(): Promise<Either<Error, DashboardStats>> {
    try {
      const [usersResult, candidatesResult, pollingStationsResult, resultsResult] = await Promise.all([
        this.userUseCases.getAllUsers(),
        this.candidateUseCases.getAllCandidates(),
        this.pollingStationUseCases.getAllPollingStations(),
        this.electionResultUseCases.getResultsWithDetails()
      ]);

      if (usersResult.isLeft()) return usersResult;
      if (candidatesResult.isLeft()) return candidatesResult;
      if (pollingStationsResult.isLeft()) return pollingStationsResult;
      if (resultsResult.isLeft()) return resultsResult;

      const users = usersResult.value;
      const candidates = candidatesResult.value;
      const pollingStations = pollingStationsResult.value;
      const results = resultsResult.value;

      // Calculate user statistics by role
      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate candidate results
      const candidateVotes = new Map<number, { name: string; party: string; votes: number }>();
      let totalVotes = 0;

      results.forEach(result => {
        totalVotes += result.votes;
        const existing = candidateVotes.get(result.candidateId);
        if (existing) {
          existing.votes += result.votes;
        } else {
          candidateVotes.set(result.candidateId, {
            name: result.candidateName,
            party: result.candidateParty,
            votes: result.votes
          });
        }
      });

      const resultsByCandidate = Array.from(candidateVotes.entries()).map(([candidateId, data]) => ({
        candidateId,
        candidateName: data.name,
        party: data.party,
        totalVotes: data.votes,
        percentage: totalVotes > 0 ? (data.votes / totalVotes) * 100 : 0
      }));

      // Calculate polling station statistics
      const pollingStationStats = pollingStations.reduce(
        (acc, station) => {
          switch (station.status) {
            case PollingStationStatus.ACTIVE:
              acc.active++;
              break;
            case PollingStationStatus.CLOSED:
              acc.inactive++;
              break;
            case PollingStationStatus.PENDING:
              acc.setup++;
              break;
          }
          return acc;
        },
        { active: 0, inactive: 0, setup: 0 }
      );

      const dashboardStats: DashboardStats = {
        totalUsers: users.length,
        totalCandidates: candidates.length,
        totalPollingStations: pollingStations.length,
        totalVotes,
        usersByRole,
        resultsByCandidate,
        pollingStationStats
      };

      return right(dashboardStats);
    } catch (error) {
      return left(new Error(`Failed to fetch dashboard statistics: ${error}`));
    }
  }

  async startElection(): Promise<Either<Error, void>> {
    try {
      // Business logic for starting an election
      // This could involve activating polling stations, notifying users, etc.
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to start election: ${error}`));
    }
  }

  async endElection(): Promise<Either<Error, void>> {
    try {
      // Business logic for ending an election
      // This could involve deactivating polling stations, generating final reports, etc.
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to end election: ${error}`));
    }
  }

  async getElectionStatus(): Promise<Either<Error, ElectionStatus>> {
    try {
      const [pollingStationsResult, resultsResult] = await Promise.all([
        this.pollingStationUseCases.getAllPollingStations(),
        this.electionResultUseCases.getAllResults()
      ]);

      if (pollingStationsResult.isLeft()) return pollingStationsResult;
      if (resultsResult.isLeft()) return resultsResult;

      const pollingStations = pollingStationsResult.value;
      const results = resultsResult.value;

      const totalRegisteredVoters = pollingStations.reduce(
        (total, station) => total + station.registeredVoters,
        0
      );

      const totalVotesCast = results.reduce(
        (total, result) => total + result.votes,
        0
      );

      const turnoutPercentage = totalRegisteredVoters > 0 
        ? (totalVotesCast / totalRegisteredVoters) * 100 
        : 0;

      const electionStatus: ElectionStatus = {
        isActive: pollingStations.some(station => station.status === PollingStationStatus.ACTIVE),
        totalRegisteredVoters,
        totalVotesCast,
        turnoutPercentage
      };

      return right(electionStatus);
    } catch (error) {
      return left(new Error(`Failed to get election status: ${error}`));
    }
  }
}
