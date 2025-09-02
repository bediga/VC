// Administrative Repositories - Interfaces for administrative entities

import { 
  Region, 
  Department, 
  Arrondissement, 
  Commune, 
  AdministrativeDivision,
  DivisionType 
} from '../entities/administrative';

// Region Repository
export interface RegionRepository {
  findAll(): Promise<Region[]>;
  findById(id: number): Promise<Region | null>;
  findByCode(code: string): Promise<Region | null>;
  create(regionData: CreateRegionData): Promise<Region>;
  update(id: number, regionData: UpdateRegionData): Promise<Region>;
  delete(id: number): Promise<void>;
}

// Department Repository
export interface DepartmentRepository {
  findAll(): Promise<Department[]>;
  findById(id: number): Promise<Department | null>;
  findByRegion(regionId: number): Promise<Department[]>;
  create(departmentData: CreateDepartmentData): Promise<Department>;
  update(id: number, departmentData: UpdateDepartmentData): Promise<Department>;
  delete(id: number): Promise<void>;
}

// Arrondissement Repository
export interface ArrondissementRepository {
  findAll(): Promise<Arrondissement[]>;
  findById(id: number): Promise<Arrondissement | null>;
  findByDepartment(departmentId: number): Promise<Arrondissement[]>;
  create(arrondissementData: CreateArrondissementData): Promise<Arrondissement>;
  update(id: number, arrondissementData: UpdateArrondissementData): Promise<Arrondissement>;
  delete(id: number): Promise<void>;
}

// Commune Repository
export interface CommuneRepository {
  findAll(): Promise<Commune[]>;
  findById(id: number): Promise<Commune | null>;
  findByArrondissement(arrondissementId: number): Promise<Commune[]>;
  create(communeData: CreateCommuneData): Promise<Commune>;
  update(id: number, communeData: UpdateCommuneData): Promise<Commune>;
  delete(id: number): Promise<void>;
}

// Administrative Division Repository (Generic)
export interface AdministrativeDivisionRepository {
  findAll(): Promise<AdministrativeDivision[]>;
  findById(id: number): Promise<AdministrativeDivision | null>;
  findByType(type: DivisionType): Promise<AdministrativeDivision[]>;
  findByParent(parentId: number): Promise<AdministrativeDivision[]>;
  findByLevel(level: number): Promise<AdministrativeDivision[]>;
  create(divisionData: CreateAdministrativeDivisionData): Promise<AdministrativeDivision>;
  update(id: number, divisionData: UpdateAdministrativeDivisionData): Promise<AdministrativeDivision>;
  delete(id: number): Promise<void>;
  getHierarchy(rootId?: number): Promise<AdministrativeDivision[]>;
}

// DTOs for Administrative entities
export interface CreateRegionData {
  name: string;
  code?: string;
}

export interface UpdateRegionData {
  name?: string;
  code?: string;
}

export interface CreateDepartmentData {
  name: string;
  regionId: number;
  code?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  regionId?: number;
  code?: string;
}

export interface CreateArrondissementData {
  name: string;
  departmentId: number;
  code?: string;
}

export interface UpdateArrondissementData {
  name?: string;
  departmentId?: number;
  code?: string;
}

export interface CreateCommuneData {
  name: string;
  arrondissementId: number;
  code?: string;
}

export interface UpdateCommuneData {
  name?: string;
  arrondissementId?: number;
  code?: string;
}

export interface CreateAdministrativeDivisionData {
  name: string;
  type: DivisionType;
  parentId?: number;
  code?: string;
}

export interface UpdateAdministrativeDivisionData {
  name?: string;
  type?: DivisionType;
  parentId?: number;
  code?: string;
}
