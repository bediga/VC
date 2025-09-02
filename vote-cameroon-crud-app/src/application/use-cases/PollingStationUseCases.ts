// Polling Station Use Cases - Business Logic for Polling Station Management
import { PollingStation, PollingStationStatus } from '../../domain/entities';
import { PollingStationRepository, CreatePollingStationData, UpdatePollingStationData } from '../../domain/repositories';
import { Either, left, right } from '../../shared/Result';

export interface PollingStationUseCases {
  getAllPollingStations(): Promise<Either<Error, PollingStation[]>>;
  getPollingStationById(id: string): Promise<Either<Error, PollingStation>>;
  createPollingStation(stationData: CreatePollingStationData): Promise<Either<Error, PollingStation>>;
  updatePollingStation(id: string, stationData: UpdatePollingStationData): Promise<Either<Error, PollingStation>>;
  deletePollingStation(id: string): Promise<Either<Error, void>>;
  getPollingStationsByRegion(region: string): Promise<Either<Error, PollingStation[]>>;
  getPollingStationsByStatus(status: PollingStationStatus): Promise<Either<Error, PollingStation[]>>;
}

export class PollingStationUseCasesImpl implements PollingStationUseCases {
  constructor(private pollingStationRepository: PollingStationRepository) {}

  async getAllPollingStations(): Promise<Either<Error, PollingStation[]>> {
    try {
      const stations = await this.pollingStationRepository.findAll();
      return right(stations);
    } catch (error) {
      return left(new Error(`Failed to fetch polling stations: ${error}`));
    }
  }

  async getPollingStationById(id: string): Promise<Either<Error, PollingStation>> {
    try {
      const station = await this.pollingStationRepository.findById(id);
      if (!station) {
        return left(new Error('Polling station not found'));
      }
      return right(station);
    } catch (error) {
      return left(new Error(`Failed to fetch polling station: ${error}`));
    }
  }

  async createPollingStation(stationData: CreatePollingStationData): Promise<Either<Error, PollingStation>> {
    try {
      // Business rule: Validate registered voters count
      if (stationData.registeredVoters < 0) {
        return left(new Error('Registered voters count cannot be negative'));
      }

      // Business rule: Validate geographic coordinates if provided
      if (stationData.latitude !== undefined && (stationData.latitude < -90 || stationData.latitude > 90)) {
        return left(new Error('Latitude must be between -90 and 90 degrees'));
      }

      if (stationData.longitude !== undefined && (stationData.longitude < -180 || stationData.longitude > 180)) {
        return left(new Error('Longitude must be between -180 and 180 degrees'));
      }

      const station = await this.pollingStationRepository.create(stationData);
      return right(station);
    } catch (error) {
      return left(new Error(`Failed to create polling station: ${error}`));
    }
  }

  async updatePollingStation(id: string, stationData: UpdatePollingStationData): Promise<Either<Error, PollingStation>> {
    try {
      const existingStation = await this.pollingStationRepository.findById(id);
      if (!existingStation) {
        return left(new Error('Polling station not found'));
      }

      // Business rule: Validate registered voters count
      if (stationData.registeredVoters !== undefined && stationData.registeredVoters < 0) {
        return left(new Error('Registered voters count cannot be negative'));
      }

      // Business rule: Validate geographic coordinates if provided
      if (stationData.latitude !== undefined && (stationData.latitude < -90 || stationData.latitude > 90)) {
        return left(new Error('Latitude must be between -90 and 90 degrees'));
      }

      if (stationData.longitude !== undefined && (stationData.longitude < -180 || stationData.longitude > 180)) {
        return left(new Error('Longitude must be between -180 and 180 degrees'));
      }

      const updatedStation = await this.pollingStationRepository.update(id, stationData);
      return right(updatedStation);
    } catch (error) {
      return left(new Error(`Failed to update polling station: ${error}`));
    }
  }

  async deletePollingStation(id: string): Promise<Either<Error, void>> {
    try {
      const station = await this.pollingStationRepository.findById(id);
      if (!station) {
        return left(new Error('Polling station not found'));
      }

      await this.pollingStationRepository.delete(id);
      return right(undefined);
    } catch (error) {
      return left(new Error(`Failed to delete polling station: ${error}`));
    }
  }

  async getPollingStationsByRegion(region: string): Promise<Either<Error, PollingStation[]>> {
    try {
      const stations = await this.pollingStationRepository.findByRegion(region);
      return right(stations);
    } catch (error) {
      return left(new Error(`Failed to fetch polling stations by region: ${error}`));
    }
  }

  async getPollingStationsByStatus(status: PollingStationStatus): Promise<Either<Error, PollingStation[]>> {
    try {
      const stations = await this.pollingStationRepository.findByStatus(status);
      return right(stations);
    } catch (error) {
      return left(new Error(`Failed to fetch polling stations by status: ${error}`));
    }
  }
}
