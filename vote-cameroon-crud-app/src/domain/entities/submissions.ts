// Result Submission and Verification Entities

export interface ResultSubmission {
  id: number;
  pollingStationId: string;
  submittedBy: string;
  submissionType: SubmissionType;
  totalVotes: number;
  registeredVoters: number;
  turnoutRate: number;
  status: SubmissionStatus;
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
}

export interface ResultSubmissionDetail {
  id: number;
  submissionId: number;
  candidateId: number;
  votes: number;
  percentage: number;
}

export interface SubmissionResult {
  id: string;
  submissionId: string;
  candidateId: string;
  votesReceived: number;
  notes?: string;
}

export interface SubmissionDocument {
  id: string;
  submissionId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  uploadDate: Date;
  checksum?: string;
}

export interface Result {
  id: number;
  pollingStationId: string;
  candidateId: number;
  votes: number;
  timestamp: Date;
  submittedBy?: string;
  verified: boolean;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationTask {
  id: string;
  submissionId: string;
  checkerId?: string;
  assignedDate?: Date;
  status: VerificationStatus;
  priority: Priority;
  verificationNotes?: string;
  completionDate?: Date;
  verificationDecision?: VerificationDecision;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationHistory {
  id: string;
  taskId: string;
  checkerId: string;
  action: string;
  notes?: string;
  createdAt: Date;
}

export enum SubmissionType {
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  CORRECTED = 'corrected'
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum VerificationDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_REVIEW = 'needs_review'
}

// Business Rules pour les soumissions et vérifications
export class SubmissionBusinessRules {
  static canSubmitResults(userRole: string): boolean {
    return ['superadmin', 'admin', 'scrutineer'].includes(userRole);
  }

  static canVerifyResults(userRole: string): boolean {
    return ['superadmin', 'admin', 'checker'].includes(userRole);
  }

  static calculateSubmissionTurnoutRate(totalVotes: number, registeredVoters: number): number {
    if (registeredVoters === 0) return 0;
    return Math.round((totalVotes / registeredVoters) * 100 * 100) / 100;
  }

  static validateSubmissionTotals(details: ResultSubmissionDetail[], totalVotes: number): boolean {
    const sumVotes = details.reduce((sum, detail) => sum + detail.votes, 0);
    return sumVotes === totalVotes;
  }

  static canRejectSubmission(userRole: string, currentStatus: SubmissionStatus): boolean {
    return ['superadmin', 'admin', 'checker'].includes(userRole) && 
           [SubmissionStatus.PENDING, SubmissionStatus.SUBMITTED].includes(currentStatus);
  }

  static getNextPriority(currentPriority: Priority): Priority {
    const priorities = [Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.URGENT];
    const currentIndex = priorities.indexOf(currentPriority);
    return currentIndex < priorities.length - 1 ? priorities[currentIndex + 1] : currentPriority;
  }

  static shouldAutoAssignVerification(submission: ResultSubmission): boolean {
    return submission.submissionType === SubmissionType.FINAL;
  }
}
