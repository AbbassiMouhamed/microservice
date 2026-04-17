import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiClient } from '../../api/api-client.service';
import { Course, Exam, ExamAttempt, User, UUID } from '../../api/api.models';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-exam-detail-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="header-row">
        <a mat-button routerLink="/exams"><mat-icon>arrow_back</mat-icon> Back to Exams</a>
      </div>
    </div>

    @if (exam(); as e) {
      <mat-card class="detail-card">
        <div class="detail-header">
          <div class="detail-icon-wrap" [class]="'status-bg-' + e.status?.toLowerCase()">
            <mat-icon>assignment</mat-icon>
          </div>
          <div class="detail-title-section">
            <h1>{{ e.title }}</h1>
            <div class="detail-badges">
              <span class="status-chip" [class]="'status-' + e.status?.toLowerCase()">
                {{ e.status }}
              </span>
            </div>
          </div>
          <div class="detail-actions" *ngIf="auth.isTeacherOrAdmin">
            <button mat-stroked-button type="button" (click)="refresh()">
              <mat-icon>refresh</mat-icon> Refresh
            </button>
            <button
              mat-flat-button
              color="primary"
              type="button"
              (click)="publish()"
              [disabled]="e.status === 'CLOSED'"
            >
              <mat-icon>publish</mat-icon> Publish
            </button>
            <button
              mat-flat-button
              color="warn"
              type="button"
              (click)="close()"
              [disabled]="e.status === 'CLOSED'"
            >
              <mat-icon>lock</mat-icon> Close
            </button>
          </div>
        </div>

        <div class="meta-cards">
          <div class="meta-card">
            <mat-icon>school</mat-icon>
            <span class="meta-label">Course</span>
            <span class="meta-value">{{ courseTitleById()(e.courseId) }}</span>
          </div>
          <div class="meta-card">
            <mat-icon>event</mat-icon>
            <span class="meta-label">Scheduled</span>
            <span class="meta-value">{{ formatDate(e.scheduledAt) }}</span>
          </div>
          <div class="meta-card">
            <mat-icon>timer</mat-icon>
            <span class="meta-label">Duration</span>
            <span class="meta-value">{{ e.durationMinutes }} min</span>
          </div>
          <div class="meta-card">
            <mat-icon>star</mat-icon>
            <span class="meta-label">Max Score</span>
            <span class="meta-value">{{ e.maxScore }}</span>
          </div>
          <div class="meta-card">
            <mat-icon>check_circle</mat-icon>
            <span class="meta-label">Passing Score</span>
            <span class="meta-value accent">{{ e.passingScore }}</span>
          </div>
        </div>
      </mat-card>

      <div class="grid">
        <mat-card class="section-card" *ngIf="auth.isTeacherOrAdmin">
          <div class="section-header">
            <h2><mat-icon>people</mat-icon> Attempts</h2>
            <a mat-stroked-button [routerLink]="['/certificates']">
              <mat-icon>workspace_premium</mat-icon> Certificates
            </a>
          </div>
          <mat-card-content>
            @if (attempts().length === 0) {
              <div class="empty-section">
                <mat-icon>quiz</mat-icon>
                <p>No attempts submitted yet</p>
              </div>
            } @else {
              <table mat-table [dataSource]="attempts()" class="table">
                <ng-container matColumnDef="student">
                  <th mat-header-cell *matHeaderCellDef>Student</th>
                  <td mat-cell *matCellDef="let a">
                    {{ studentNameById()(a.studentId) }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="score">
                  <th mat-header-cell *matHeaderCellDef>Score</th>
                  <td mat-cell *matCellDef="let a">
                    <span class="score-text" [class.passed]="a.passed" [class.failed]="!a.passed">
                      {{ a.score }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="skill">
                  <th mat-header-cell *matHeaderCellDef>Skill</th>
                  <td mat-cell *matCellDef="let a">{{ a.skillLevel }}</td>
                </ng-container>

                <ng-container matColumnDef="passed">
                  <th mat-header-cell *matHeaderCellDef>Result</th>
                  <td mat-cell *matCellDef="let a">
                    <span class="result-badge" [class.pass]="a.passed" [class.fail]="!a.passed">
                      <mat-icon>{{ a.passed ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ a.passed ? 'Passed' : 'Failed' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="submittedAt">
                  <th mat-header-cell *matHeaderCellDef>Submitted</th>
                  <td mat-cell *matCellDef="let a">{{ formatDate(a.submittedAt) }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let a" class="row-actions">
                    <button
                      mat-flat-button
                      color="primary"
                      type="button"
                      (click)="issue(a.id)"
                      [disabled]="!a.passed"
                      matTooltip="Issue certificate"
                    >
                      <mat-icon>workspace_premium</mat-icon> Issue
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      type="button"
                      (click)="deleteAttempt(a)"
                      matTooltip="Delete attempt"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="attemptColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: attemptColumns"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="section-card" *ngIf="auth.isTeacherOrAdmin; else studentAttempt">
          <div class="section-header">
            <h2><mat-icon>edit_note</mat-icon> Submit Attempt</h2>
          </div>
          <mat-card-content>
            <p class="hint">Exam must be <strong>PUBLISHED</strong> to accept attempts.</p>

            <div *ngIf="!canSubmitAttempts()" class="warn-banner">
              <mat-icon>warning</mat-icon>
              <span
                >Attempts are disabled — exam is not published yet. Use the
                <strong>Publish</strong> button above.</span
              >
            </div>

            <form [formGroup]="form" (ngSubmit)="submitAttempt()" class="form">
              <mat-form-field appearance="outline">
                <mat-label>Student</mat-label>
                <mat-select formControlName="studentId" [disabled]="!canSubmitAttempts()">
                  @for (s of students(); track s.id) {
                    <mat-option [value]="s.id" [disabled]="attemptedStudentIds().has(s.id)">
                      {{ s.name }} ({{ s.email }})
                      @if (attemptedStudentIds().has(s.id)) {
                        — already attempted
                      }
                    </mat-option>
                  }
                </mat-select>
                <mat-hint>Each student can submit only one attempt per exam.</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Score</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="score"
                  [disabled]="!canSubmitAttempts()"
                />
                <mat-hint>Allowed range: 0 – {{ exam()?.maxScore ?? '—' }}</mat-hint>
              </mat-form-field>

              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="!canSubmitAttempts() || form.invalid || loading()"
              >
                <mat-icon>send</mat-icon> Submit Attempt
              </button>
            </form>

            <div *ngIf="students().length === 0" class="warn-banner" style="margin-top: 16px">
              <mat-icon>info</mat-icon>
              <span>No students found. Ask an admin to create students.</span>
            </div>
          </mat-card-content>
        </mat-card>

        <ng-template #studentAttempt>
          <mat-card class="section-card">
            <div class="section-header">
              <h2><mat-icon>edit_note</mat-icon> Submit My Attempt</h2>
            </div>
            <mat-card-content>
              <p class="hint">Exam must be <strong>PUBLISHED</strong> to accept attempts.</p>

              <div *ngIf="!canSubmitAttempts()" class="warn-banner">
                <mat-icon>warning</mat-icon>
                <span>Attempts are disabled — exam is not published.</span>
              </div>

              <form [formGroup]="myForm" (ngSubmit)="submitMyAttempt()" class="form">
                <mat-form-field appearance="outline">
                  <mat-label>Score</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="score"
                    [disabled]="!canSubmitAttempts()"
                  />
                  <mat-hint>Allowed range: 0 – {{ exam()?.maxScore ?? '—' }}</mat-hint>
                </mat-form-field>

                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="!canSubmitAttempts() || myForm.invalid || loading()"
                >
                  <mat-icon>send</mat-icon> Submit
                </button>
              </form>

              <p class="hint" style="margin-top: 12px; color: rgba(0,0,0,.5)">
                After you pass, a teacher/admin can issue your certificate.
              </p>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>
    }
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 8px;
      }
      .header-row a {
        text-decoration: none;
      }

      .detail-card {
        border-radius: 16px !important;
        margin-bottom: 24px;
        padding: 24px !important;
      }
      .detail-header {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        flex-wrap: wrap;
        margin-bottom: 24px;
      }
      .detail-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon {
          color: #fff;
          font-size: 28px;
          width: 28px;
          height: 28px;
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
      .detail-title-section {
        flex: 1;
        min-width: 200px;
        h1 {
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #1a1a2e;
        }
      }
      .detail-badges {
        display: flex;
        gap: 8px;
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
      .detail-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .meta-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .meta-card {
        flex: 1 1 140px;
        background: #fafbff;
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
          color: #1565c0;
        }
      }
      .meta-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: rgba(0, 0, 0, 0.45);
      }
      .meta-value {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a2e;
        &.accent {
          color: #1565c0;
        }
      }

      .grid {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 20px;
        align-items: start;
      }

      .section-card {
        border-radius: 16px !important;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 0;
        flex-wrap: wrap;
        gap: 12px;
        h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
          display: flex;
          align-items: center;
          gap: 8px;
          mat-icon {
            font-size: 22px;
            width: 22px;
            height: 22px;
            color: #1565c0;
          }
        }
        a {
          text-decoration: none;
        }
      }

      .empty-section {
        text-align: center;
        padding: 32px 16px;
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: rgba(0, 0, 0, 0.12);
        }
        p {
          color: rgba(0, 0, 0, 0.4);
          margin: 8px 0 0;
        }
      }

      .table {
        width: 100%;
      }
      .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .score-text {
        font-weight: 600;
        &.passed {
          color: #2e7d32;
        }
        &.failed {
          color: #c62828;
        }
      }
      .result-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 20px;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
        &.pass {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.fail {
          background: #fce4ec;
          color: #c62828;
        }
      }

      .form {
        display: grid;
        gap: 14px;
      }
      .hint {
        margin-top: 0;
        font-size: 14px;
      }
      .warn-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #fff3e0;
        color: #e65100;
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 16px;
        font-size: 14px;
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }

      @media (max-width: 900px) {
        .meta-cards {
          flex-direction: column;
        }
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ExamDetailPage {
  readonly auth = inject(AuthService);

  private readonly api = inject(ApiClient);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly datePipe = inject(DatePipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly exam = signal<Exam | null>(null);
  readonly attempts = signal<ExamAttempt[]>([]);
  readonly students = signal<User[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly loading = signal(false);

  readonly canSubmitAttempts = computed(() => this.exam()?.status === 'PUBLISHED');

  readonly attemptedStudentIds = computed(() => {
    const ids = new Set<UUID>();
    for (const a of this.attempts()) {
      ids.add(a.studentId);
    }
    return ids;
  });

  readonly attemptColumns = ['student', 'score', 'skill', 'passed', 'submittedAt', 'actions'];

  readonly studentNameById = computed(() => {
    const map = new Map<UUID, string>();
    for (const s of this.students()) {
      map.set(s.id, s.name);
    }
    return (id: UUID) => map.get(id) ?? 'Unknown student';
  });

  readonly courseTitleById = computed(() => {
    const map = new Map<UUID, string>();
    for (const c of this.courses()) {
      map.set(c.id, c.title);
    }
    return (id: UUID) => map.get(id) ?? 'Unknown course';
  });

  readonly form = this.fb.group({
    studentId: ['', [Validators.required]],
    score: [0, [Validators.required, Validators.min(0)]],
  });

  readonly myForm = this.fb.group({
    score: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.refresh();
  }

  back(): void {
    this.router.navigateByUrl('/exams');
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'medium') ?? value;
  }

  refresh(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.api
      .listCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.courses.set(data),
        error: () => this.snack.open('Failed to load courses', 'Dismiss', { duration: 4000 }),
      });

    this.api
      .getExam(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (e) => {
          this.exam.set(e);
          this.applyScoreValidators(e.maxScore);
        },
        error: (err) =>
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to load exam',
            'Dismiss',
            {
              duration: 5000,
            },
          ),
      });

    if (this.auth.isTeacherOrAdmin) {
      this.api
        .listExamAttempts(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => this.attempts.set(data),
          error: () => this.snack.open('Failed to load attempts', 'Dismiss', { duration: 4000 }),
        });

      this.api
        .listUsers('STUDENT')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => this.students.set(data),
          error: () => this.snack.open('Failed to load students', 'Dismiss', { duration: 4000 }),
        });
    } else {
      this.attempts.set([]);
      this.students.set([]);
    }
  }

  publish(): void {
    const e = this.exam();
    if (!e) return;
    this.api
      .publishExam(e.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.exam.set(updated);
          this.snack.open('Exam published', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) =>
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to publish exam',
            'Dismiss',
            {
              duration: 5000,
            },
          ),
      });
  }

  close(): void {
    const e = this.exam();
    if (!e) return;
    this.api
      .closeExam(e.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.exam.set(updated);
          this.snack.open('Exam closed', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) =>
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to close exam',
            'Dismiss',
            {
              duration: 5000,
            },
          ),
      });
  }

  submitAttempt(): void {
    const e = this.exam();
    if (!e) return;
    if (e.status !== 'PUBLISHED') {
      this.snack.open('Exam must be PUBLISHED to accept attempts', 'Dismiss', { duration: 4000 });
      return;
    }
    if (this.form.invalid) return;

    this.loading.set(true);
    const v = this.form.getRawValue();

    this.api
      .submitAttempt(e.id, {
        studentId: String(v.studentId),
        score: Number(v.score),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.form.reset({ studentId: '', score: 0 });
          this.snack.open('Attempt submitted', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to submit attempt',
            'Dismiss',
            { duration: 5000 },
          );
        },
      });
  }

  submitMyAttempt(): void {
    const e = this.exam();
    if (!e) return;
    if (e.status !== 'PUBLISHED') {
      this.snack.open('Exam must be PUBLISHED to accept attempts', 'Dismiss', { duration: 4000 });
      return;
    }
    if (this.myForm.invalid) return;

    this.loading.set(true);
    const v = this.myForm.getRawValue();

    this.api
      .submitMyAttempt(e.id, {
        score: Number(v.score),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.myForm.reset({ score: 0 });
          this.snack.open('Attempt submitted', 'Dismiss', { duration: 2500 });
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to submit attempt',
            'Dismiss',
            { duration: 5000 },
          );
        },
      });
  }

  issue(attemptId: UUID): void {
    this.api
      .issueCertificate(attemptId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cert) => {
          this.snack.open(`Certificate issued: ${cert.id}`, 'Dismiss', { duration: 4000 });
        },
        error: (err) =>
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to issue certificate',
            'Dismiss',
            {
              duration: 5000,
            },
          ),
      });
  }

  deleteAttempt(attempt: ExamAttempt): void {
    if (!confirm(`Delete attempt for ${this.studentNameById()(attempt.studentId)}?`)) return;

    this.api
      .deleteAttempt(attempt.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Attempt deleted', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) =>
          this.snack.open(
            err?.error?.detail ?? err?.error?.message ?? 'Failed to delete attempt',
            'Dismiss',
            {
              duration: 5000,
            },
          ),
      });
  }

  private applyScoreValidators(maxScore: number): void {
    const validators = [Validators.required, Validators.min(0), Validators.max(maxScore)];

    this.form.controls.score.setValidators(validators);
    this.form.controls.score.updateValueAndValidity({ emitEvent: false });

    this.myForm.controls.score.setValidators(validators);
    this.myForm.controls.score.updateValueAndValidity({ emitEvent: false });
  }
}
