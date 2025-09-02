// Submission and Verification Repositories

import {
  ResultSubmission,
  ResultSubmissionDetail,
  SubmissionResult,
  SubmissionDocument,
  Result,
  VerificationTask,
  VerificationHistory,
  SubmissionType,
  SubmissionStatus,
  VerificationStatus,
  Priority,
  VerificationDecision
} from '../entities/submissions';

// Result Submission Repository
export interface ResultSubmissionRepository {
  findAll(): Promise<ResultSubmission[]>;
  findById(id: number): Promise<ResultSubmission | null>;
  findByPollingStation(pollingStationId: string): Promise<ResultSubmission[]>;
  findBySubmitter(submitterId: string): Promise<ResultSubmission[]>;
  findByStatus(status: SubmissionStatus): Promise<ResultSubmission[]>;
  findByType(type: SubmissionType): Promise<ResultSubmission[]>;
  create(submissionData: CreateResultSubmissionData): Promise<ResultSubmission>;
  update(id: number, submissionData: UpdateResultSubmissionData): Promise<ResultSubmission>;
  delete(id: number): Promise<void>;
  verify(id: number, verifierId: string, notes?: string): Promise<ResultSubmission>;
  reject(id: number, verifierId: string, reason: string): Promise<ResultSubmission>;
}

// Result Submission Detail Repository
export interface ResultSubmissionDetailRepository {
  findAll(): Promise<ResultSubmissionDetail[]>;
  findBySubmission(submissionId: number): Promise<ResultSubmissionDetail[]>;
  findByCandidate(candidateId: number): Promise<ResultSubmissionDetail[]>;
  create(detailData: CreateResultSubmissionDetailData): Promise<ResultSubmissionDetail>;
  update(id: number, detailData: UpdateResultSubmissionDetailData): Promise<ResultSubmissionDetail>;
  delete(id: number): Promise<void>;
  bulkCreate(details: CreateResultSubmissionDetailData[]): Promise<ResultSubmissionDetail[]>;
}

// Submission Document Repository
export interface SubmissionDocumentRepository {
  findAll(): Promise<SubmissionDocument[]>;
  findBySubmission(submissionId: string): Promise<SubmissionDocument[]>;
  findByType(documentType: string): Promise<SubmissionDocument[]>;
  create(documentData: CreateSubmissionDocumentData): Promise<SubmissionDocument>;
  update(id: string, documentData: UpdateSubmissionDocumentData): Promise<SubmissionDocument>;
  delete(id: string): Promise<void>;
}

// Verification Task Repository
export interface VerificationTaskRepository {
  findAll(): Promise<VerificationTask[]>;
  findById(id: string): Promise<VerificationTask | null>;
  findByChecker(checkerId: string): Promise<VerificationTask[]>;
  findByStatus(status: VerificationStatus): Promise<VerificationTask[]>;
  findByPriority(priority: Priority): Promise<VerificationTask[]>;
  findPendingTasks(): Promise<VerificationTask[]>;
  create(taskData: CreateVerificationTaskData): Promise<VerificationTask>;
  update(id: string, taskData: UpdateVerificationTaskData): Promise<VerificationTask>;
  delete(id: string): Promise<void>;
  assign(id: string, checkerId: string): Promise<VerificationTask>;
  complete(id: string, decision: VerificationDecision, notes?: string): Promise<VerificationTask>;
}

// Verification History Repository
export interface VerificationHistoryRepository {
  findAll(): Promise<VerificationHistory[]>;
  findByTask(taskId: string): Promise<VerificationHistory[]>;
  findByChecker(checkerId: string): Promise<VerificationHistory[]>;
  create(historyData: CreateVerificationHistoryData): Promise<VerificationHistory>;
}

// Generic Result Repository
export interface ResultRepository {
  findAll(): Promise<Result[]>;
  findById(id: number): Promise<Result | null>;
  findByPollingStation(pollingStationId: string): Promise<Result[]>;
  findByCandidate(candidateId: number): Promise<Result[]>;
  findBySubmitter(submitterId: string): Promise<Result[]>;
  findVerified(): Promise<Result[]>;
  findUnverified(): Promise<Result[]>;
  create(resultData: CreateResultData): Promise<Result>;
  update(id: number, resultData: UpdateResultData): Promise<Result>;
  delete(id: number): Promise<void>;
  verify(id: number, notes?: string): Promise<Result>;
}

// DTOs for Submissions and Verifications
export interface CreateResultSubmissionData {
  pollingStationId: string;
  submittedBy: string;
  submissionType: SubmissionType;
  totalVotes: number;
  registeredVoters: number;
  notes?: string;
}

export interface UpdateResultSubmissionData {
  submissionType?: SubmissionType;
  totalVotes?: number;
  registeredVoters?: number;
  status?: SubmissionStatus;
  notes?: string;
}

export interface CreateResultSubmissionDetailData {
  submissionId: number;
  candidateId: number;
  votes: number;
}

export interface UpdateResultSubmissionDetailData {
  votes?: number;
  percentage?: number;
}

export interface CreateSubmissionDocumentData {
  submissionId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  checksum?: string;
}

export interface UpdateSubmissionDocumentData {
  documentType?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  checksum?: string;
}

export interface CreateVerificationTaskData {
  submissionId: string;
  priority?: Priority;
  verificationNotes?: string;
}

export interface UpdateVerificationTaskData {
  checkerId?: string;
  status?: VerificationStatus;
  priority?: Priority;
  verificationNotes?: string;
  verificationDecision?: VerificationDecision;
  rejectionReason?: string;
}

export interface CreateVerificationHistoryData {
  taskId: string;
  checkerId: string;
  action: string;
  notes?: string;
}

export interface CreateResultData {
  pollingStationId: string;
  candidateId: number;
  votes: number;
  submittedBy?: string;
  verificationNotes?: string;
}

export interface UpdateResultData {
  votes?: number;
  verified?: boolean;
  verificationNotes?: string;
}
