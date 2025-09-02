// Clean Architecture Integration Layer
import { DependencyContainer } from './infrastructure';

// Initialize the clean architecture system
export function initializeCleanArchitecture() {
  const dbUrl = process.env.TURSO_URL;
  const dbAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !dbAuthToken) {
    throw new Error('Database configuration is missing. Please check TURSO_URL and TURSO_AUTH_TOKEN environment variables.');
  }

  DependencyContainer.initialize(dbUrl, dbAuthToken);
}

// Get the dependency container instance
export function getContainer() {
  return DependencyContainer.getInstance();
}

// Convenience exports for easy access to use cases and services
export function getUserUseCases() {
  return getContainer().getUserUseCases();
}

export function getCandidateUseCases() {
  return getContainer().getCandidateUseCases();
}

export function getPollingStationUseCases() {
  return getContainer().getPollingStationUseCases();
}

export function getElectionResultUseCases() {
  return getContainer().getElectionResultUseCases();
}

export function getElectionManagementService() {
  return getContainer().getElectionManagementService();
}

// Export types for external use
export type { UserUseCases, CandidateUseCases, PollingStationUseCases, ElectionResultUseCases } from './application';
export type { ElectionManagementService, DashboardStats, ElectionStatus } from './application';

// Export domain entities for external use
export type { User, Candidate, PollingStation, ElectionResult } from './domain/entities';
export { UserRole, PollingStationStatus } from './domain/entities';

// Export error handling utilities
export type { Either } from './shared/Result';
export { left, right, isLeft, isRight, fold, map, flatMap } from './shared/Result';
