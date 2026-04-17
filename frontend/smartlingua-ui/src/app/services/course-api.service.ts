import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Course,
  CourseSummary,
  Chapter,
  Resource,
  Seance,
  CourseStatistics,
  PageResponse,
  CourseLevel,
} from '../models';

@Injectable({ providedIn: 'root' })
export class CourseApiService {
  private readonly base = '/api/courses';
  private readonly metier = '/api/metier';

  constructor(private http: HttpClient) {}

  // Courses
  listCourses(page = 0, size = 20, level?: CourseLevel): Observable<PageResponse<Course>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (level) params = params.set('level', level);
    return this.http.get<PageResponse<Course>>(this.base, { params });
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.base}/${id}`);
  }

  getCourseSummary(id: number): Observable<CourseSummary> {
    return this.http.get<CourseSummary>(`${this.base}/${id}/summary`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.base, course);
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.base}/${id}`, course);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Chapters
  listChapters(courseId: number): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.base}/${courseId}/chapters`);
  }

  createChapter(courseId: number, chapter: Partial<Chapter>): Observable<Chapter> {
    return this.http.post<Chapter>(`${this.base}/${courseId}/chapters`, chapter);
  }

  deleteChapter(courseId: number, chapterId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}/chapters/${chapterId}`);
  }

  // Resources
  listResources(courseId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.base}/${courseId}/resources`);
  }

  createResource(courseId: number, resource: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>(`${this.base}/${courseId}/resources`, resource);
  }

  deleteResource(courseId: number, resourceId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}/resources/${resourceId}`);
  }

  // Seances
  listSeances(courseId: number): Observable<Seance[]> {
    return this.http.get<Seance[]>(`${this.base}/${courseId}/seances`);
  }

  createSeance(courseId: number, seance: Partial<Seance>): Observable<Seance> {
    return this.http.post<Seance>(`${this.base}/${courseId}/seances`, seance);
  }

  deleteSeance(courseId: number, seanceId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${courseId}/seances/${seanceId}`);
  }

  // Metier / Statistics
  getStatistics(): Observable<CourseStatistics> {
    return this.http.get<CourseStatistics>(`${this.metier}/statistics`);
  }

  getUpcomingSeances(): Observable<Seance[]> {
    return this.http.get<Seance[]>(`${this.metier}/upcoming-seances`);
  }
}
