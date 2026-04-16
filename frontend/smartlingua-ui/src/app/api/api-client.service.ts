import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Certificate,
  Course,
  Exam,
  ExamAttempt,
  User,
  UserType,
  UUID,
  VerifyResult,
} from './api.models';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  // Courses
  listCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/courses`);
  }

  createCourse(input: {
    title: string;
    level?: string | null;
    startDate?: string | null;
  }): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}/courses`, {
      title: input.title,
      level: input.level ?? null,
      startDate: input.startDate ?? null,
    });
  }

  // Users
  listUsers(type?: UserType): Observable<User[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<User[]>(`${this.baseUrl}/users`, { params });
  }

  createUser(input: { name: string; email: string; userType: UserType }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, input);
  }

  // Exams
  listExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.baseUrl}/exams`);
  }

  getExam(id: UUID): Observable<Exam> {
    return this.http.get<Exam>(`${this.baseUrl}/exams/${id}`);
  }

  createExam(input: {
    courseId: UUID;
    title: string;
    scheduledAt?: string | null;
    durationMinutes: number;
    maxScore: number;
    passingScore: number;
  }): Observable<Exam> {
    return this.http.post<Exam>(`${this.baseUrl}/exams`, {
      ...input,
      scheduledAt: input.scheduledAt ?? null,
    });
  }

  publishExam(id: UUID): Observable<Exam> {
    return this.http.put<Exam>(`${this.baseUrl}/exams/${id}/publish`, {});
  }

  closeExam(id: UUID): Observable<Exam> {
    return this.http.put<Exam>(`${this.baseUrl}/exams/${id}/close`, {});
  }

  listExamAttempts(examId: UUID): Observable<ExamAttempt[]> {
    return this.http.get<ExamAttempt[]>(`${this.baseUrl}/exams/${examId}/attempts`);
  }

  submitAttempt(examId: UUID, input: { studentId: UUID; score: number }): Observable<ExamAttempt> {
    return this.http.post<ExamAttempt>(`${this.baseUrl}/exams/${examId}/attempts`, input);
  }

  submitMyAttempt(examId: UUID, input: { score: number }): Observable<ExamAttempt> {
    return this.http.post<ExamAttempt>(`${this.baseUrl}/exams/${examId}/attempts/me`, input);
  }

  getAttempt(attemptId: UUID): Observable<ExamAttempt> {
    return this.http.get<ExamAttempt>(`${this.baseUrl}/attempts/${attemptId}`);
  }

  // Certificates
  listCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.baseUrl}/certificates`);
  }

  listMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.baseUrl}/certificates/me`);
  }

  issueCertificate(examAttemptId: UUID): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.baseUrl}/certificates/issue`, { examAttemptId });
  }

  getCertificate(id: UUID): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.baseUrl}/certificates/${id}`);
  }

  verifyCertificate(id: UUID): Observable<VerifyResult> {
    return this.http.get<VerifyResult>(`${this.baseUrl}/certificates/${id}/verify`);
  }

  verifyMyCertificate(id: UUID): Observable<VerifyResult> {
    return this.http.get<VerifyResult>(`${this.baseUrl}/certificates/me/${id}/verify`);
  }

  getCertificateDownloadUrl(id: UUID): string {
    return `${this.baseUrl}/certificates/${id}/download`;
  }

  getMyCertificateDownloadUrl(id: UUID): string {
    return `${this.baseUrl}/certificates/me/${id}/download`;
  }
}
