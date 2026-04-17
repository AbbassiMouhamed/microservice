import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ForumPost, ForumComment, Announcement, ForumNotification } from '../models';

@Injectable({ providedIn: 'root' })
export class ForumApiService {
  private readonly base = '/api/forum';

  constructor(private http: HttpClient) {}

  // Posts
  listPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.base}/posts`);
  }

  getPost(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.base}/posts/${id}`);
  }

  createPost(data: { title: string; content: string; category?: string }): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.base}/posts`, data);
  }

  updatePost(
    id: number,
    data: { title: string; content: string; category?: string },
  ): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.base}/posts/${id}`, data);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/posts/${id}`);
  }

  getTrendingPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.base}/posts/trending`);
  }

  getRecommendedPosts(category?: string, limit = 10): Observable<ForumPost[]> {
    let params = new HttpParams().set('limit', limit);
    if (category) params = params.set('category', category);
    return this.http.get<ForumPost[]>(`${this.base}/posts/recommendations`, { params });
  }

  getFlaggedPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.base}/posts/flagged`);
  }

  moderatePost(id: number, data: { status: string }): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.base}/posts/${id}/moderate`, data);
  }

  likePost(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/posts/${id}/like`, {});
  }

  unlikePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/posts/${id}/like`);
  }

  reportPost(id: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.base}/posts/${id}/report`, { reason });
  }

  // Comments
  listComments(postId: number): Observable<ForumComment[]> {
    return this.http.get<ForumComment[]>(`${this.base}/posts/${postId}/comments`);
  }

  createComment(
    postId: number,
    data: { content: string; parentCommentId?: number | null },
  ): Observable<ForumComment> {
    return this.http.post<ForumComment>(`${this.base}/posts/${postId}/comments`, data);
  }

  updateComment(commentId: number, data: { content: string }): Observable<ForumComment> {
    return this.http.put<ForumComment>(`${this.base}/posts/comments/${commentId}`, data);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/posts/comments/${commentId}`);
  }

  // Announcements
  listAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.base}/announcements`);
  }

  getAnnouncement(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.base}/announcements/${id}`);
  }

  createAnnouncement(data: { title: string; content: string }): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.base}/announcements`, data);
  }

  updateAnnouncement(
    id: number,
    data: { title: string; content: string },
  ): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.base}/announcements/${id}`, data);
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/announcements/${id}`);
  }

  // Notifications
  listNotifications(): Observable<ForumNotification[]> {
    return this.http.get<ForumNotification[]>(`${this.base}/notifications`);
  }

  getUnreadNotifications(): Observable<ForumNotification[]> {
    return this.http.get<ForumNotification[]>(`${this.base}/notifications/unread`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.base}/notifications/unread/count`);
  }

  markNotificationRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.post<void>(`${this.base}/notifications/read-all`, {});
  }
}
