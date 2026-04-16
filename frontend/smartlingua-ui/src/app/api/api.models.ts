export type UUID = string;

export type UserType = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SkillLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Course {
  id: UUID;
  title: string;
  level: string | null;
  startDate: string | null;
}

export interface User {
  id: UUID;
  name: string;
  email: string;
  userType: UserType;
}

export interface Exam {
  id: UUID;
  courseId: UUID;
  title: string;
  scheduledAt: string | null;
  durationMinutes: number;
  maxScore: number;
  passingScore: number;
  status: ExamStatus;
}

export interface ExamAttempt {
  id: UUID;
  examId: UUID;
  studentId: UUID;
  score: number;
  passed: boolean;
  skillLevel: SkillLevel;
  submittedAt: string;
}

export interface Certificate {
  id: UUID;
  examAttemptId: UUID;
  studentId: UUID;
  studentName?: string;
  studentEmail?: string;
  examTitle?: string;
  issuedAt: string;
  lastVerifiedAt?: string | null;
  lastVerifiedValid?: boolean | null;
  skillLevel: SkillLevel;
  signatureBase64: string;
}

export interface VerifyResult {
  valid: boolean;
}
