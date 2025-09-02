// Election Results Use Cases - Business Logic for Election Results Management
import { ElectionResult } from '../../domain/entities';
import { 
  ElectionResultRepository, 
  CreateElectionResultData, 
  UpdateElectionResultData,
  ElectionResultWithDetails 
} from '../../domain/repositories';
import { Either, left, right } from '../../shared/Result';

export interface ElectionResultUseCases {
  getAllResults(): Promise<Either<Error, ElectionResult[]>>;
  getResultsByCandidate(candidateId: number): Promise<Either<Error, ElectionResult[]>>;
  getResultsByPollingStation(stationId: string): Promise<Either<Error, ElectionResult[]>>;
  createResult(resultData: CreateElectionResultData): Promise<Either<Error, ElectionResult>>;
  updateResult(id: number, resultData: UpdateElectionResultData): Promise<Either<Error, ElectionResult>>;
  getResultsWithDetails(): Promise<Either<Error, ElectionResultWithDetails[]>>;
  verifyResult(id: number, verificationNotes?: string): Promise<Either<Error, ElectionResult>>;
}

export class ElectionResultUseCasesImpl implements ElectionResultUseCases {
  constructor(private electionResultRepository: ElectionResultRepository) {}

  async getAllResults(): Promise<Either<Error, ElectionResult[]>> {
    try {
      const results = await this.electionResultRepository.findAll();
      return right(results);
    } catch (error) {
      return left(new Error(`Failed to fetch election results: ${error}`));
    }
  }

  async getResultsByCandidate(candidateId: number): Promise<Either<Error, ElectionResult[]>> {
    try {
      const results = await this.electionResultRepository.findByCandidate(candidateId);
      return right(results);
    } catch (error) {
      return left(new Error(`Failed to fetch results by candidate: ${error}`));
    }
  }

  async getResultsByPollingStation(stationId: string): Promise<Either<Error, ElectionResult[]>> {
    try {
      const results = await this.electionResultRepository.findByPollingStation(stationId);
      return right(results);
    } catch (error) {
      return left(new Error(`Failed to fetch results by polling station: ${error}`));
    }
  }

  async createResult(resultData: CreateElectionResultData): Promise<Either<Error, ElectionResult>> {
    try {
      // Business rule: Validate vote counts
      if (resultData.votes < 0) {
        return left(new Error('Vote count cannot be negative'));
      }

      if (resultData.totalVotes < 0) {
        return left(new Error('Total vote count cannot be negative'));
      }

      if (resultData.votes > resultData.totalVotes) {
        return left(new Error('Candidate votes cannot exceed total votes'));
      }

      const result = await this.electionResultRepository.create(resultData);
      return right(result);
    } catch (error) {
      return left(new Error(`Failed to create election result: ${error}`));
    }
  }

  async updateResult(id: number, resultData: UpdateElectionResultData): Promise<Either<Error, ElectionResult>> {
    try {
      // Business rule: Validate vote counts if provided
      if (resultData.votes !== undefined && resultData.votes < 0) {
        return left(new Error('Vote count cannot be negative'));
      }

      if (resultData.totalVotes !== undefined && resultData.totalVotes < 0) {
        return left(new Error('Total vote count cannot be negative'));
      }

      // If both votes and totalVotes are provided, validate the relationship
      if (resultData.votes !== undefined && resultData.totalVotes !== undefined) {
        if (resultData.votes > resultData.totalVotes) {
          return left(new Error('Candidate votes cannot exceed total votes'));
        }
      }

      const result = await this.electionResultRepository.update(id, resultData);
      return right(result);
    } catch (error) {
      return left(new Error(`Failed to update election result: ${error}`));
    }
  }

  async getResultsWithDetails(): Promise<Either<Error, ElectionResultWithDetails[]>> {
    try {
      const results = await this.electionResultRepository.findWithDetails();
      return right(results);
    } catch (error) {
      return left(new Error(`Failed to fetch detailed results: ${error}`));
    }
  }

  async verifyResult(id: number, verificationNotes?: string): Promise<Either<Error, ElectionResult>> {
    try {
      const updateData: UpdateElectionResultData = {
        verified: true,
        verificationNotes: verificationNotes || 'Result verified'
      };

      const result = await this.electionResultRepository.update(id, updateData);
      return right(result);
    } catch (error) {
      return left(new Error(`Failed to verify election result: ${error}`));
    }
  }
}
