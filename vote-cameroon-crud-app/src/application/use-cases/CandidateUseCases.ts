// Candidate Use Cases - Business Logic for Candidate Management
import { Candidate } from '../../domain/entities';
import { CandidateRepository, CreateCandidateData, UpdateCandidateData } from '../../domain/repositories';
import { Either, left, right } from '../../shared/Result';

export interface CandidateUseCases {
  getAllCandidates(): Promise<Either<Error, Candidate[]>>;
  getCandidateById(id: number): Promise<Either<Error, Candidate>>;
  createCandidate(candidateData: CreateCandidateData): Promise<Either<Error, Candidate>>;
  updateCandidate(id: number, candidateData: UpdateCandidateData): Promise<Either<Error, Candidate>>;
  deleteCandidate(id: number): Promise<Either<Error, void>>;
  getCandidatesByParty(party: string): Promise<Either<Error, Candidate[]>>;
}

export class CandidateUseCasesImpl implements CandidateUseCases {
  constructor(private candidateRepository: CandidateRepository) {}

  async getAllCandidates(): Promise<Either<Error, Candidate[]>> {
    try {
      const candidates = await this.candidateRepository.findAll();
      return right(candidates);
    } catch (error) {
      return left(new Error(`Failed to fetch candidates: ${error}`));
    }
  }

  async getCandidateById(id: number): Promise<Either<Error, Candidate>> {
    try {
      const candidate = await this.candidateRepository.findById(id);
      if (!candidate) {
        return left(new Error('Candidate not found'));
      }
      return right(candidate);
    } catch (error) {
      return left(new Error(`Failed to fetch candidate: ${error}`));
    }
  }

  async createCandidate(candidateData: CreateCandidateData): Promise<Either<Error, Candidate>> {
    try {
      // Business rule: Check if candidate name already exists for the same party
      const fullName = `${candidateData.firstName} ${candidateData.lastName}`;
      const existingCandidate = await this.candidateRepository.findByNameAndPosition(
        fullName, 
        candidateData.party
      );
      
      if (existingCandidate) {
        return left(new Error('A candidate with this name already exists for this party'));
      }

      const candidate = await this.candidateRepository.create(candidateData);
      return right(candidate);
    } catch (error) {
      return left(new Error(`Failed to create candidate: ${error}`));
    }
  }

  async updateCandidate(id: number, candidateData: UpdateCandidateData): Promise<Either<Error, Candidate>> {
    try {
      const existingCandidate = await this.candidateRepository.findById(id);
      if (!existingCandidate) {
        return left(new Error('Candidate not found'));
      }

      // Business rule: Check name uniqueness if name or party is being updated
      if (candidateData.firstName || candidateData.lastName || candidateData.party) {
        const checkFirstName = candidateData.firstName || existingCandidate.firstName;
        const checkLastName = candidateData.lastName || existingCandidate.lastName;
        const checkParty = candidateData.party || existingCandidate.party;
        const fullName = `${checkFirstName} ${checkLastName}`;
        
        const duplicateCandidate = await this.candidateRepository.findByNameAndPosition(fullName, checkParty);
        if (duplicateCandidate && duplicateCandidate.id !== id) {
          return left(new Error('A candidate with this name already exists for this party'));
        }
      }

      const updatedCandidate = await this.candidateRepository.update(id, candidateData);
      return right(updatedCandidate);
    } catch (error) {
      return left(new Error(`Failed to update candidate: ${error}`));
    }
  }

  async deleteCandidate(id: number): Promise<Either<Error, void>> {
    try {
      const candidate = await this.candidateRepository.findById(id);
      if (!candidate) {
        return left(new Error('Candidate not found'));
      }

      await this.candidateRepository.delete(id);
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete candidate: ${error}`));
    }
  }

  async getCandidatesByParty(party: string): Promise<Either<Error, Candidate[]>> {
    try {
      const candidates = await this.candidateRepository.findByParty(party);
      return right(candidates);
    } catch (error) {
      return left(new Error(`Failed to fetch candidates by party: ${error}`));
    }
  }
}
