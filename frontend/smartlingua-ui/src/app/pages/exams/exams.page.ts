import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiClient } from '../../api/api-client.service';
import { Exam } from '../../api/api.models';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-exams-page',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>Exams</h1>
          <p>Manage and take final exams for your courses</p>
        </div>
        @if (auth.isTeacherOrAdmin) {
          <a mat-flat-button color="primary" routerLink="/exams/new">
            <mat-icon>add</mat-icon> Create Exam
          </a>
        }
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-row">
      <div class="stat-card">
        <mat-icon class="stat-icon">assignment</mat-icon>
        <div class="stat-info">
          <span class="stat-value">{{ exams().length }}</span>
          <span class="stat-label">Total Exams</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon published">publish</mat-icon>
        <div class="stat-info">
          <span class="stat-value">{{ publishedCount() }}</span>
          <span class="stat-label">Published</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon draft">edit_note</mat-icon>
        <div class="stat-info">
          <span class="stat-value">{{ draftCount() }}</span>
          <span class="stat-label">Drafts</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon closed">lock</mat-icon>
        <div class="stat-info">
          <span class="stat-value">{{ closedCount() }}</span>
          <span class="stat-label">Closed</span>
        </div>
      </div>
    </div>

    <!-- Exam Cards -->
    <div class="exam-grid">
      @for (e of exams(); track e.id) {
        <mat-card class="exam-card" [routerLink]="['/exams', e.id]">
          <div class="exam-card-top">
            <div class="exam-icon-wrap" [class]="'status-bg-' + e.status?.toLowerCase()">
              <mat-icon>assignment</mat-icon>
            </div>
            <span class="status-chip" [class]="'status-' + e.status?.toLowerCase()">
              {{ e.status }}
            </span>
          </div>
          <mat-card-content>
            <h3 class="exam-title">{{ e.title }}</h3>
            <div class="exam-meta">
              @if (e.scheduledAt) {
                <div class="meta-item">
                  <mat-icon>event</mat-icon>
                  <span>{{ formatDate(e.scheduledAt) }}</span>
                </div>
              }
              <div class="meta-item">
                <mat-icon>timer</mat-icon>
                <span>{{ e.durationMinutes }} min</span>
              </div>
            </div>
            <div class="score-bar">
              <div class="score-item">
                <span class="score-label">Max Score</span>
                <span class="score-value">{{ e.maxScore }}</span>
              </div>
              <div class="score-divider"></div>
              <div class="score-item">
                <span class="score-label">Passing</span>
                <span class="score-value pass">{{ e.passingScore }}</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions class="exam-actions">
            <a mat-button [routerLink]="['/exams', e.id]">
              View Details <mat-icon>arrow_forward</mat-icon>
            </a>
            @if (auth.isTeacherOrAdmin) {
              <button
                mat-icon-button
                color="warn"
                type="button"
                matTooltip="Delete exam"
                (click)="deleteExam(e); $event.stopPropagation()"
              >
                <mat-icon>delete_outline</mat-icon>
              </button>
            }
          </mat-card-actions>
        </mat-card>
      }
    </div>

    @if (exams().length === 0) {
      <div class="empty-state">
        <mat-icon>assignment</mat-icon>
        <h3>No exams yet</h3>
        <p>There are no exams available at the moment.</p>
        @if (auth.isTeacherOrAdmin) {
          <a mat-flat-button color="primary" routerLink="/exams/new">Create First Exam</a>
        }
      </div>
    }
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 24px;
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 4px;
          color: #1a1a2e;
        }
        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.55);
        }
      }
      .header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .stats-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 24px;
      }
      .stat-card {
        flex: 1 1 160px;
        display: flex;
        align-items: center;
        gap: 14px;
        background: #fff;
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      }
      .stat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #1565c0;
        &.published {
          color: #2e7d32;
        }
        &.draft {
          color: #e65100;
        }
        &.closed {
          color: #616161;
        }
      }
      .stat-info {
        display: flex;
        flex-direction: column;
      }
      .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
        line-height: 1;
      }
      .stat-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 2px;
      }

      .exam-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      .exam-card {
        flex: 1 1 320px;
        cursor: pointer;
        border-radius: 16px !important;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
      }
      .exam-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 20px 0;
      }
      .exam-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon {
          color: #fff;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
        &.status-bg-draft {
          background: linear-gradient(135deg, #ff9800, #f57c00);
        }
        &.status-bg-published {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
        }
        &.status-bg-closed {
          background: linear-gradient(135deg, #9e9e9e, #616161);
        }
      }
      .status-chip {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 20px;
        letter-spacing: 0.3px;
        &.status-draft {
          background: #fff3e0;
          color: #e65100;
        }
        &.status-published {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.status-closed {
          background: #f5f5f5;
          color: #616161;
        }
      }

      .exam-title {
        font-size: 17px;
        font-weight: 600;
        margin: 0 0 12px;
        color: #1a1a2e;
      }
      .exam-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-bottom: 16px;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.55);
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .score-bar {
        display: flex;
        align-items: center;
        background: #fafbff;
        border-radius: 10px;
        padding: 12px 16px;
        gap: 16px;
      }
      .score-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
      .score-label {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.45);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .score-value {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a2e;
        &.pass {
          color: #1565c0;
        }
      }
      .score-divider {
        width: 1px;
        height: 32px;
        background: rgba(0, 0, 0, 0.1);
      }

      .exam-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 8px !important;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: rgba(0, 0, 0, 0.15);
        }
        h3 {
          margin: 16px 0 8px;
          color: #1a1a2e;
        }
        p {
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
        }
      }
      a {
        text-decoration: none;
      }
    `,
  ],
})
export class ExamsPage {
  readonly auth = inject(AuthService);

  private readonly api = inject(ApiClient);
  private readonly snack = inject(MatSnackBar);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly exams = signal<Exam[]>([]);
  readonly publishedCount = computed(
    () => this.exams().filter((e) => e.status === 'PUBLISHED').length,
  );
  readonly draftCount = computed(() => this.exams().filter((e) => e.status === 'DRAFT').length);
  readonly closedCount = computed(() => this.exams().filter((e) => e.status === 'CLOSED').length);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.api
      .listExams()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.exams.set(data),
        error: () => this.snack.open('Failed to load exams', 'Dismiss', { duration: 4000 }),
      });
  }

  deleteExam(exam: Exam): void {
    if (!confirm(`Delete exam "${exam.title}"?`)) return;

    this.api
      .deleteExam(exam.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Exam deleted', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) =>
          this.snack.open(err?.error?.message ?? 'Failed to delete exam', 'Dismiss', {
            duration: 5000,
          }),
      });
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'medium') ?? value;
  }
}
