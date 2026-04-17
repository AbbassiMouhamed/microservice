import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { CourseApiService } from '../../services/course-api.service';
import { ForumApiService } from '../../services/forum-api.service';
import { AdaptiveApiService } from '../../services/adaptive-api.service';
import { CourseStatistics, Seance, AdaptiveProgress, ForumPost } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome -->
      <div class="welcome-section">
        <h1>Welcome back, {{ auth.username }}!</h1>
        <p>Here's what's happening with your learning journey today.</p>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <mat-icon>school</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.totalCourses ?? '—' }}</span>
            <span class="stat-label">Courses</span>
          </div>
        </div>
        <div class="stat-card accent">
          <mat-icon>video_library</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.videoCount ?? '—' }}</span>
            <span class="stat-label">Videos</span>
          </div>
        </div>
        <div class="stat-card success">
          <mat-icon>picture_as_pdf</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.pdfCount ?? '—' }}</span>
            <span class="stat-label">Documents</span>
          </div>
        </div>
        <div class="stat-card warn">
          <mat-icon>event</mat-icon>
          <div class="stat-info">
            <span class="stat-value">{{ stats()?.totalSeances ?? '—' }}</span>
            <span class="stat-label">Sessions</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Progress Card (Student) -->
        @if (auth.isStudent && progress()) {
          <mat-card class="progress-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-avatar-icon">trending_up</mat-icon>
              <mat-card-title>My Progress</mat-card-title>
              <mat-card-subtitle>Level: {{ progress()!.currentLevel }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="progress-stats">
                <div class="progress-item">
                  <span class="progress-label">Completed</span>
                  <span class="progress-value"
                    >{{ progress()!.completedItems }} / {{ progress()!.totalItems }}</span
                  >
                </div>
                <mat-progress-bar
                  mode="determinate"
                  [value]="progress()!.completionPercentage"
                ></mat-progress-bar>
                <span class="progress-percent"
                  >{{ progress()!.completionPercentage | number: '1.0-0' }}%</span
                >
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button routerLink="/learning">View Learning Path</a>
            </mat-card-actions>
          </mat-card>
        }

        <!-- Upcoming Sessions -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-avatar-icon">calendar_today</mat-icon>
            <mat-card-title>Upcoming Sessions</mat-card-title>
            <mat-card-subtitle>Next scheduled learning sessions</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (upcomingSeances().length === 0) {
              <div class="empty-state">
                <mat-icon>event_busy</mat-icon>
                <p>No upcoming sessions</p>
              </div>
            } @else {
              <div class="seance-list">
                @for (s of upcomingSeances().slice(0, 5); track s.id) {
                  <div class="seance-item">
                    <div class="seance-dot" [class]="'status-' + s.status.toLowerCase()"></div>
                    <div class="seance-info">
                      <span class="seance-title">{{ s.title }}</span>
                      <span class="seance-time"
                        >{{ s.startDateTime | date: 'MMM d, y · h:mm a' }} ·
                        {{ s.durationMinutes }}min</span
                      >
                    </div>
                    <span class="seance-status">{{ s.status }}</span>
                  </div>
                }
              </div>
            }
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/courses">View All Courses</a>
          </mat-card-actions>
        </mat-card>

        <!-- Recent Forum Posts -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-avatar-icon">forum</mat-icon>
            <mat-card-title>Community Activity</mat-card-title>
            <mat-card-subtitle>Trending discussions</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (trendingPosts().length === 0) {
              <div class="empty-state">
                <mat-icon>chat_bubble_outline</mat-icon>
                <p>No trending posts yet</p>
              </div>
            } @else {
              <div class="post-list">
                @for (p of trendingPosts().slice(0, 5); track p.id) {
                  <a class="post-item" [routerLink]="['/forum', p.id]">
                    <div class="post-info">
                      <span class="post-title">{{ p.title }}</span>
                      <span class="post-meta"
                        >{{ p.authorName }} · {{ p.commentsCount }} comments ·
                        {{ p.likesCount }} likes</span
                      >
                    </div>
                    @if (p.trending) {
                      <mat-icon class="trending-icon">local_fire_department</mat-icon>
                    }
                  </a>
                }
              </div>
            }
          </mat-card-content>
          <mat-card-actions>
            <a mat-button routerLink="/forum">Visit Forum</a>
          </mat-card-actions>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-avatar-icon">bolt</mat-icon>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actions-grid">
              <a class="action-item" routerLink="/quiz/take">
                <mat-icon>quiz</mat-icon>
                <span>Take a Quiz</span>
              </a>
              <a class="action-item" routerLink="/messaging/chatbot">
                <mat-icon>smart_toy</mat-icon>
                <span>AI Chatbot</span>
              </a>
              <a class="action-item" routerLink="/messaging/translator">
                <mat-icon>translate</mat-icon>
                <span>Translator</span>
              </a>
              <a class="action-item" routerLink="/quiz/nlp">
                <mat-icon>spellcheck</mat-icon>
                <span>Text Analyzer</span>
              </a>
              @if (auth.isTeacherOrAdmin) {
                <a class="action-item" routerLink="/courses/new">
                  <mat-icon>add_circle</mat-icon>
                  <span>New Course</span>
                </a>
                <a class="action-item" routerLink="/exams/new">
                  <mat-icon>note_add</mat-icon>
                  <span>New Exam</span>
                </a>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
      }

      .welcome-section {
        margin-bottom: 28px;
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 6px;
          color: #1a1a2e;
        }
        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.55);
          font-size: 15px;
        }
      }

      .stats-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        flex: 1 1 200px;
        min-width: 180px;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px 24px;
        border-radius: 16px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
        &.primary mat-icon {
          color: #1565c0;
        }
        &.accent mat-icon {
          color: #7c4dff;
        }
        &.success mat-icon {
          color: #2e7d32;
        }
        &.warn mat-icon {
          color: #e65100;
        }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .stat-label {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
      }

      .content-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        > * {
          flex: 1 1 380px;
          min-width: 0;
        }
      }

      .card-avatar-icon {
        background: rgba(21, 101, 192, 0.08);
        color: #1565c0;
        border-radius: 12px;
        display: flex !important;
        align-items: center;
        justify-content: center;
      }

      .empty-state {
        text-align: center;
        padding: 24px 0;
        color: rgba(0, 0, 0, 0.4);
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          margin-bottom: 8px;
        }
        p {
          margin: 0;
        }
      }

      .seance-list,
      .post-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .seance-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.02);
      }
      .seance-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        &.status-planned {
          background: #ff9800;
        }
        &.status-ongoing {
          background: #4caf50;
        }
        &.status-done {
          background: #9e9e9e;
        }
      }
      .seance-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .seance-title {
        font-size: 14px;
        font-weight: 500;
      }
      .seance-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }
      .seance-status {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        color: rgba(0, 0, 0, 0.4);
      }

      .post-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        text-decoration: none;
        color: inherit;
        transition: background 0.15s;
        &:hover {
          background: rgba(0, 0, 0, 0.03);
        }
      }
      .post-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .post-title {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .post-meta {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }
      .trending-icon {
        color: #ff6d00;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .progress-card {
      }
      .progress-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .progress-item {
        display: flex;
        justify-content: space-between;
      }
      .progress-label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
      .progress-value {
        font-size: 14px;
        font-weight: 600;
      }
      .progress-percent {
        font-size: 13px;
        font-weight: 600;
        color: #1565c0;
        text-align: right;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 12px;
      }
      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px 8px;
        border-radius: 12px;
        text-decoration: none;
        color: #1a1a2e;
        background: rgba(0, 0, 0, 0.02);
        transition: all 0.2s;
        mat-icon {
          color: #1565c0;
        }
        span {
          font-size: 13px;
          font-weight: 500;
          text-align: center;
        }
        &:hover {
          background: rgba(21, 101, 192, 0.06);
          transform: translateY(-1px);
        }
      }

      @media (max-width: 600px) {
        .content-grid > * {
          flex: 1 1 100%;
        }
        .stat-card {
          flex: 1 1 calc(50% - 8px);
          min-width: 140px;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly courseApi = inject(CourseApiService);
  private readonly forumApi = inject(ForumApiService);
  private readonly adaptiveApi = inject(AdaptiveApiService);

  stats = signal<CourseStatistics | null>(null);
  upcomingSeances = signal<Seance[]>([]);
  trendingPosts = signal<ForumPost[]>([]);
  progress = signal<AdaptiveProgress | null>(null);

  ngOnInit(): void {
    this.courseApi.getStatistics().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });

    this.courseApi.getUpcomingSeances().subscribe({
      next: (s) => this.upcomingSeances.set(s),
      error: () => {},
    });

    this.forumApi.getTrendingPosts().subscribe({
      next: (p) => this.trendingPosts.set(p),
      error: () => {},
    });

    if (this.auth.isStudent) {
      this.adaptiveApi.getMyProgress().subscribe({
        next: (p) => this.progress.set(p),
        error: () => {},
      });
    }
  }
}
