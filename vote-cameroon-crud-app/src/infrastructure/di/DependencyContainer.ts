// Infrastructure - Dependency Injection Container
import { 
  UserUseCases, 
  UserUseCasesImpl,
  CandidateUseCases,
  CandidateUseCasesImpl,
  PollingStationUseCases,
  PollingStationUseCasesImpl,
  ElectionResultUseCases,
  ElectionResultUseCasesImpl,
  ElectionManagementService,
  ElectionManagementServiceImpl
} from '../../application';

import { 
  UserRepository,
  CandidateRepository,
  PollingStationRepository,
  ElectionResultRepository
} from '../../domain/repositories';

import { TursoUserRepository } from '../repositories/TursoUserRepository';
import { TursoCandidateRepository } from '../repositories/TursoCandidateRepository';

interface Dependencies {
  // Repositories
  userRepository: UserRepository;
  candidateRepository: CandidateRepository;
  pollingStationRepository: PollingStationRepository;
  electionResultRepository: ElectionResultRepository;
  
  // Use Cases
  userUseCases: UserUseCases;
  candidateUseCases: CandidateUseCases;
  pollingStationUseCases: PollingStationUseCases;
  electionResultUseCases: ElectionResultUseCases;
  
  // Services
  electionManagementService: ElectionManagementService;
}

export class DependencyContainer {
  private static instance: DependencyContainer;
  private dependencies: Dependencies;

  private constructor(dbUrl: string, dbAuthToken: string) {
    // Initialize repositories
    const userRepository = new TursoUserRepository(dbUrl, dbAuthToken);
    const candidateRepository = new TursoCandidateRepository(dbUrl, dbAuthToken);
    
    // TODO: Initialize other repositories when implemented
    const pollingStationRepository = userRepository as any; // Temporary placeholder
    const electionResultRepository = userRepository as any; // Temporary placeholder

    // Initialize use cases
    const userUseCases = new UserUseCasesImpl(userRepository);
    const candidateUseCases = new CandidateUseCasesImpl(candidateRepository);
    const pollingStationUseCases = new PollingStationUseCasesImpl(pollingStationRepository);
    const electionResultUseCases = new ElectionResultUseCasesImpl(electionResultRepository);

    // Initialize services
    const electionManagementService = new ElectionManagementServiceImpl(
      userUseCases,
      candidateUseCases,
      pollingStationUseCases,
      electionResultUseCases
    );

    this.dependencies = {
      userRepository,
      candidateRepository,
      pollingStationRepository,
      electionResultRepository,
      userUseCases,
      candidateUseCases,
      pollingStationUseCases,
      electionResultUseCases,
      electionManagementService
    };
  }

  static initialize(dbUrl: string, dbAuthToken: string): void {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer(dbUrl, dbAuthToken);
    }
  }

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      throw new Error('DependencyContainer must be initialized before use');
    }
    return DependencyContainer.instance;
  }

  get<T extends keyof Dependencies>(key: T): Dependencies[T] {
    return this.dependencies[key];
  }

  // Convenience getters
  getUserUseCases(): UserUseCases {
    return this.dependencies.userUseCases;
  }

  getCandidateUseCases(): CandidateUseCases {
    return this.dependencies.candidateUseCases;
  }

  getPollingStationUseCases(): PollingStationUseCases {
    return this.dependencies.pollingStationUseCases;
  }

  getElectionResultUseCases(): ElectionResultUseCases {
    return this.dependencies.electionResultUseCases;
  }

  getElectionManagementService(): ElectionManagementService {
    return this.dependencies.electionManagementService;
  }
}
