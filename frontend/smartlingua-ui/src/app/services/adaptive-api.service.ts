import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdaptiveProfile,
  AdaptiveProgress,
  LearningPath,
  LearningPathItem,
  Recommendation,
  LevelTestResult,
  CatalogOverview,
  TeacherDashboard,
  LearnerEntry,
  LearningPlan,
  PlacementTestResponse,
  LevelTestResponse,
  CourseEnrollmentResult,
  CourseAccessResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdaptiveApiService {
  private readonly base = '/api/adaptive';

  constructor(private http: HttpClient) {}

  // === /me endpoints (current user from JWT) ===

  submitPlacementTest(score: number, weakAreas: string): Observable<PlacementTestResponse> {
    return this.http.post<PlacementTestResponse>(`${this.base}/me/placement-test`, {
      score,
      weakAreas,
    });
  }

  generateLearningPath(targetLevel: string, goal: string): Observable<LearningPath> {
    return this.http.post<LearningPath>(`${this.base}/me/learning-path`, { targetLevel, goal });
  }

  getMyLearningPath(): Observable<LearningPath> {
    return this.http.get<LearningPath>(`${this.base}/me/learning-path`);
  }

  updateItemStatus(itemId: number, newStatus: string): Observable<LearningPathItem> {
    return this.http.put<LearningPathItem>(`${this.base}/me/learning-path/items/${itemId}/status`, {
      newStatus,
    });
  }

  submitLevelTest(score: number, weakAreas?: string): Observable<LevelTestResponse> {
    return this.http.post<LevelTestResponse>(`${this.base}/me/level-test`, { score, weakAreas });
  }

  submitLevelTestFromQuiz(attemptId: number): Observable<LevelTestResponse> {
    return this.http.post<LevelTestResponse>(`${this.base}/me/level-test/from-quiz`, { attemptId });
  }

  getMyProfile(): Observable<AdaptiveProfile> {
    return this.http.get<AdaptiveProfile>(`${this.base}/me/profile`);
  }

  getMyProgress(): Observable<AdaptiveProgress> {
    return this.http.get<AdaptiveProgress>(`${this.base}/me/progress`);
  }

  getLatestLevelTest(): Observable<LevelTestResult> {
    return this.http.get<LevelTestResult>(`${this.base}/me/level-test/latest`);
  }

  checkCourseAccess(courseId: number): Observable<CourseAccessResponse> {
    return this.http.get<CourseAccessResponse>(`${this.base}/me/course-access/${courseId}`);
  }

  getMyCatalog(): Observable<CatalogOverview> {
    return this.http.get<CatalogOverview>(`${this.base}/me/catalog`);
  }

  enrollInCourse(courseId: number): Observable<CourseEnrollmentResult> {
    return this.http.post<CourseEnrollmentResult>(`${this.base}/me/enroll/${courseId}`, {});
  }

  updateChapterStatus(courseId: number, chapterId: number, newStatus: string): Observable<void> {
    return this.http.put<void>(`${this.base}/me/courses/${courseId}/chapters/${chapterId}/status`, {
      newStatus,
    });
  }

  getLearningPlan(courseId: number): Observable<LearningPlan> {
    return this.http.get<LearningPlan>(`${this.base}/me/courses/${courseId}/plan`);
  }

  getMyRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.base}/me/recommendations`);
  }

  // === Teacher endpoints ===

  getTeacherDashboard(): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.base}/teacher/dashboard`);
  }

  listLearners(): Observable<LearnerEntry[]> {
    return this.http.get<LearnerEntry[]>(`${this.base}/teacher/learners`);
  }

  getLearnerProfile(studentId: number): Observable<AdaptiveProfile> {
    return this.http.get<AdaptiveProfile>(`${this.base}/teacher/learners/${studentId}/profile`);
  }

  getLearnerProgress(studentId: number): Observable<AdaptiveProgress> {
    return this.http.get<AdaptiveProgress>(`${this.base}/teacher/learners/${studentId}/progress`);
  }

  getLearnerLearningPath(studentId: number): Observable<LearningPath> {
    return this.http.get<LearningPath>(`${this.base}/teacher/learners/${studentId}/learning-path`);
  }

  getLearnerRecommendations(studentId: number): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(
      `${this.base}/teacher/learners/${studentId}/recommendations`,
    );
  }

  resolveAlert(alertId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/teacher/alerts/${alertId}/resolve`, {});
  }

  // === Student lookup by ID ===

  getStudentProfile(studentId: number): Observable<AdaptiveProfile> {
    return this.http.get<AdaptiveProfile>(`${this.base}/students/${studentId}/profile`);
  }

  getStudentProgress(studentId: number): Observable<AdaptiveProgress> {
    return this.http.get<AdaptiveProgress>(`${this.base}/students/${studentId}/progress`);
  }
}
