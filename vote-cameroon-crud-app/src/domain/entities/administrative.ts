// Administrative Entities - Hiérarchie Administrative du Cameroun

export interface Region {
  id: number;
  name: string;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: number;
  name: string;
  regionId: number;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Arrondissement {
  id: number;
  name: string;
  departmentId: number;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commune {
  id: number;
  name: string;
  arrondissementId: number;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdministrativeDivision {
  id: number;
  name: string;
  type: DivisionType;
  parentId?: number;
  level: number;
  code?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DivisionType {
  REGION = 'region',
  DEPARTMENT = 'department',
  ARRONDISSEMENT = 'arrondissement',
  COMMUNE = 'commune'
}

// Business Rules pour les divisions administratives
export class AdministrativeBusinessRules {
  static validateHierarchy(parentType: DivisionType, childType: DivisionType): boolean {
    const validHierarchy: Record<DivisionType, DivisionType[]> = {
      [DivisionType.REGION]: [DivisionType.DEPARTMENT],
      [DivisionType.DEPARTMENT]: [DivisionType.ARRONDISSEMENT],
      [DivisionType.ARRONDISSEMENT]: [DivisionType.COMMUNE],
      [DivisionType.COMMUNE]: []
    };

    return validHierarchy[parentType]?.includes(childType) || false;
  }

  static calculateLevel(type: DivisionType): number {
    const levels = {
      [DivisionType.REGION]: 1,
      [DivisionType.DEPARTMENT]: 2,
      [DivisionType.ARRONDISSEMENT]: 3,
      [DivisionType.COMMUNE]: 4
    };

    return levels[type];
  }

  static canDeleteDivision(division: AdministrativeDivision, hasChildren: boolean): boolean {
    return !hasChildren;
  }
}
