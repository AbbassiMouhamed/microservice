import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question, QuizAttemptResult, AnswerSubmission, NlpAnalyzeResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class QuizApiService {
  private readonly base = '/api/quiz';

  constructor(private http: HttpClient) {}

  // Questions
  listQuestions(level?: string, skillType?: string): Observable<Question[]> {
    let params = new HttpParams();
    if (level) params = params.set('level', level);
    if (skillType) params = params.set('skillType', skillType);
    return this.http.get<Question[]>(`${this.base}/questions`, { params });
  }

  createQuestion(question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(`${this.base}/questions`, question);
  }

  updateQuestion(id: number, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${this.base}/questions/${id}`, question);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/questions/${id}`);
  }

  // Attempts
  startAttempt(): Observable<QuizAttemptResult> {
    return this.http.post<QuizAttemptResult>(`${this.base}/attempts`, {});
  }

  completeAttempt(attemptId: number, answers: AnswerSubmission[]): Observable<QuizAttemptResult> {
    return this.http.post<QuizAttemptResult>(`${this.base}/attempts/${attemptId}/complete`, {
      answers,
    });
  }

  getAttempt(attemptId: number): Observable<QuizAttemptResult> {
    return this.http.get<QuizAttemptResult>(`${this.base}/attempts/${attemptId}`);
  }

  listMyAttempts(): Observable<QuizAttemptResult[]> {
    return this.http.get<QuizAttemptResult[]>(`${this.base}/attempts`);
  }

  // NLP
  analyzeText(text: string, language: string): Observable<NlpAnalyzeResponse> {
    return this.http.post<NlpAnalyzeResponse>(`${this.base}/nlp/analyze`, { text, language });
  }
}
