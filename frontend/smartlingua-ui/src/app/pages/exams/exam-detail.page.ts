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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
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
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="page-title">Exam details</div>
      <div class="page-subtitle">
        {{ auth.isTeacherOrAdmin ? 'Teacher / Admin' : 'Student' }}
      </div>
    </div>

    <div class="top-actions">
      <button mat-button type="button" (click)="back()">Back</button>
    </div>

    <mat-card *ngIf="exam() as e">
      <mat-card-title class="title-row">
        <span>{{ e.title }}</span>
        <span class="spacer"></span>
        <span class="status">{{ e.status }}</span>
      </mat-card-title>

      <mat-card-content>
        <div class="meta">
          <div>
            <strong>Course</strong>
            <div>{{ courseTitleById()(e.courseId) }}</div>
          </div>
          <div>
            <strong>Scheduled</strong>
            <div>{{ formatDate(e.scheduledAt) }}</div>
          </div>
          <div>
            <strong>Duration</strong>
            <div>{{ e.durationMinutes }} min</div>
          </div>
          <div>
            <strong>Max score</strong>
            <div>{{ e.maxScore }}</div>
          </div>
          <div>
            <strong>Passing score</strong>
            <div>{{ e.passingScore }}</div>
          </div>
        </div>

        <div class="actions">
          <button mat-stroked-button type="button" (click)="refresh()">Refresh</button>
          <button
            *ngIf="auth.isTeacherOrAdmin"
            mat-raised-button
            color="primary"
            type="button"
            (click)="publish()"
            [disabled]="e.status === 'CLOSED'"
          >
            Publish
          </button>
          <button
            *ngIf="auth.isTeacherOrAdmin"
            mat-raised-button
            color="warn"
            type="button"
            (click)="close()"
            [disabled]="e.status === 'CLOSED'"
          >
            Close
          </button>
        </div>
      </mat-card-content>
    </mat-card>

    <div class="grid">
      <mat-card *ngIf="auth.isTeacherOrAdmin">
        <mat-card-title>Attempts</mat-card-title>
        <mat-card-content>
          <table mat-table [dataSource]="attempts()" class="table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let a">
                {{ studentNameById()(a.studentId) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Score</th>
              <td mat-cell *matCellDef="let a">{{ a.score }}</td>
            </ng-container>

            <ng-container matColumnDef="skill">
              <th mat-header-cell *matHeaderCellDef>Skill</th>
              <td mat-cell *matCellDef="let a">{{ a.skillLevel }}</td>
            </ng-container>

            <ng-container matColumnDef="passed">
              <th mat-header-cell *matHeaderCellDef>Passed</th>
              <td mat-cell *matCellDef="let a">{{ a.passed ? 'Yes' : 'No' }}</td>
            </ng-container>

            <ng-container matColumnDef="submittedAt">
              <th mat-header-cell *matHeaderCellDef>Submitted</th>
              <td mat-cell *matCellDef="let a">{{ formatDate(a.submittedAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a" class="row-actions">
                <a mat-button [routerLink]="['/certificates']" *ngIf="a.passed">Certificates</a>
                <button
                  mat-raised-button
                  color="primary"
                  type="button"
                  (click)="issue(a.id)"
                  [disabled]="!a.passed"
                >
                  Issue
                </button>
                <button mat-button color="warn" type="button" (click)="deleteAttempt(a)">
                  Delete
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="attemptColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: attemptColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="auth.isTeacherOrAdmin; else studentAttempt">
        <mat-card-title>Submit attempt (for a student)</mat-card-title>
        <mat-card-content>
          <p class="hint">Exam must be <strong>PUBLISHED</strong> to accept attempts.</p>

          <mat-card *ngIf="!canSubmitAttempts()" class="warn">
            <mat-card-content>
              Attempts are disabled because this exam is not published. Use the
              <strong>Publish</strong> button above, then refresh.
            </mat-card-content>
          </mat-card>

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
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!canSubmitAttempts() || form.invalid || loading()"
            >
              Submit
            </button>
          </form>

          <mat-card *ngIf="students().length === 0" class="warn">
            <mat-card-content>
              No students found. Ask an admin to create students.
            </mat-card-content>
          </mat-card>
        </mat-card-content>
      </mat-card>

      <ng-template #studentAttempt>
        <mat-card>
          <mat-card-title>Submit my attempt</mat-card-title>
          <mat-card-content>
            <p class="hint">Exam must be <strong>PUBLISHED</strong> to accept attempts.</p>

            <mat-card *ngIf="!canSubmitAttempts()" class="warn">
              <mat-card-content>
                Attempts are disabled because this exam is not published.
              </mat-card-content>
            </mat-card>

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
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!canSubmitAttempts() || myForm.invalid || loading()"
              >
                Submit
              </button>
            </form>

            <p class="hint" style="margin-top: 12px">
              After you pass, a teacher/admin can issue your certificate.
            </p>
          </mat-card-content>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .top-actions {
        margin-bottom: 12px;
      }
      .page-header {
        display: grid;
        gap: 4px;
        margin-bottom: 12px;
      }
      .page-title {
        font-size: 20px;
        font-weight: 500;
        line-height: 28px;
      }
      .page-subtitle {
        opacity: 0.8;
      }
      .title-row {
        display: flex;
        align-items: center;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .status {
        font-weight: 500;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .mono {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
          monospace;
        font-size: 12px;
        overflow-wrap: anywhere;
      }
      .sub {
        opacity: 0.75;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 16px;
        margin-top: 16px;
        align-items: start;
      }
      .table {
        width: 100%;
      }
      .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .form {
        display: grid;
        gap: 12px;
      }
      .hint {
        margin-top: 0;
      }
      .warn {
        margin-top: 16px;
      }
      @media (max-width: 900px) {
        .meta {
          grid-template-columns: 1fr;
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
