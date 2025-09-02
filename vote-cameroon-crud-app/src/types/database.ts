// Types for the database schema
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'scrutineer' | 'checker' | 'observer';
  polling_station_id?: string;
  avatarPath?: string;
  created_at: string;
  updated_at: string;
  is_active: number;
  region?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  phone_number?: string;
  must_change_password: number;
  last_login_at?: string;
  password_changed_at?: string;
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  number: number;
  color?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: number;
}

export interface VotingCenter {
  id: string;
  name: string;
  address: string;
  commune_id: number;
  latitude?: number;
  longitude?: number;
  capacity: number;
  polling_stations_count: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  commune_name?: string;
  department_name?: string;
  region_name?: string;
}

export interface PollingStation {
  id: string;
  name: string;
  region?: string;
  department?: string;
  commune?: string;
  arrondissement?: string;
  address?: string;
  registered_voters: number;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'active' | 'closed' | 'results_submitted';
  votes_submitted: number;
  turnout_rate: number;
  last_update?: string;
  scrutineers_count: number;
  observers_count: number;
  created_at: string;
  updated_at: string;
}

export interface ElectionResult {
  id: number;
  candidate_id: number;
  polling_station_id?: string;
  votes: number;
  percentage: number;
  total_votes: number;
  submitted_at: string;
  verified: boolean;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResultSubmission {
  id: number;
  polling_station_id: string;
  submitted_by: string;
  submission_type: 'preliminary' | 'final' | 'corrected';
  total_votes: number;
  registered_voters: number;
  turnout_rate: number;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  submitted_at: string;
  verified_at?: string;
  verified_by?: string;
  notes?: string;
}

export interface VerificationTask {
  id: string;
  submission_id: string;
  checker_id?: string;
  assigned_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  verification_notes?: string;
  completion_date?: string;
  verification_decision?: 'approved' | 'rejected' | 'needs_review';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// Form types
export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: User['role'];
  region?: string;
  department?: string;
  arrondissement?: string;
  commune?: string;
  phone_number?: string;
  is_active: boolean;
}

export interface CandidateFormData {
  name: string;
  party: string;
  number?: number;
  color?: string;
  description?: string;
  photo_url?: string;
  status: string;
  region?: string;
  department?: string;
  commune?: string;
  arrondissement?: string;
}

export interface PollingStationFormData {
  name: string;
  region?: string;
  department?: string;
  commune?: string;
  arrondissement?: string;
  address?: string;
  registered_voters: number;
  latitude?: number;
  longitude?: number;
  status: PollingStation['status'];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalUsers: number;
  totalCandidates: number;
  totalPollingStations: number;
  totalSubmissions: number;
  pendingVerifications: number;
  turnoutRate: number;
  usersByRole: Record<string, number>;
  submissionsByStatus: Record<string, number>;
}

export interface RolePermission {
  id: number;
  role: 'superadmin' | 'admin' | 'scrutineer' | 'checker' | 'observer';
  permission: string;
  created_at: string;
}

export interface RolePermissionFormData {
  role: 'superadmin' | 'admin' | 'scrutineer' | 'checker' | 'observer';
  permission: string;
}
