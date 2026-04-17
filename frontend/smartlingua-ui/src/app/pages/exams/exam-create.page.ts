import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiClient } from '../../api/api-client.service';
import { Course } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-exam-create-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <a mat-button routerLink="/exams"><mat-icon>arrow_back</mat-icon> Back to Exams</a>

    <div class="page-header">
      <h1>Create Exam</h1>
      <p>Set up a new final exam for a course</p>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <p class="hint">
          Create a final exam for a course. You can publish it later to accept attempts.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Course</mat-label>
            <mat-select formControlName="courseId">
              @for (c of courses(); track c.id) {
                <mat-option [value]="c.id">{{ c.title }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Exam Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g. Final Exam — French B1" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Scheduled at (optional)</mat-label>
            <input
              #scheduledAtInput
              matInput
              type="datetime-local"
              formControlName="scheduledAt"
              (click)="openNativePicker(scheduledAtInput)"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              aria-label="Open date and time picker"
              (click)="openNativePicker(scheduledAtInput)"
            >
              <mat-icon>event</mat-icon>
            </button>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="durationMinutes" />
              <mat-icon matPrefix>timer</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Max Score</mat-label>
              <input matInput type="number" formControlName="maxScore" />
              <mat-icon matPrefix>star</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Passing Score</mat-label>
              <input matInput type="number" formControlName="passingScore" />
              <mat-icon matPrefix>check_circle</mat-icon>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="back()">Cancel</button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
            >
              <mat-icon>add</mat-icon> Create Exam
            </button>
          </div>
        </form>

        <div *ngIf="courses().length === 0" class="warn-banner">
          <mat-icon>info</mat-icon>
          <span>No courses yet. Create one in the <strong>Courses</strong> section first.</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .page-header {
        margin: 16px 0 24px;
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
      a[routerLink] {
        text-decoration: none;
      }
      .form-card {
        max-width: 800px;
        border-radius: 16px !important;
      }
      .hint {
        margin-top: 0;
        color: rgba(0, 0, 0, 0.55);
        margin-bottom: 20px;
      }
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .full-width {
        width: 100%;
      }
      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 8px;
      }
      .warn-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #fff3e0;
        color: #e65100;
        border-radius: 10px;
        padding: 12px 16px;
        margin-top: 20px;
        font-size: 14px;
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }
    `,
  ],
})
export class ExamCreatePage {
  private readonly api = inject(ApiClient);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly courses = signal<Course[]>([]);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    courseId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(2)]],
    scheduledAt: [''],
    durationMinutes: [60, [Validators.required, Validators.min(1)]],
    maxScore: [100, [Validators.required, Validators.min(1)]],
    passingScore: [50, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.api
      .listCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.courses.set(data),
        error: () => this.snack.open('Failed to load courses', 'Dismiss', { duration: 4000 }),
      });
  }

  openNativePicker(input: HTMLInputElement): void {
    const anyInput = input as HTMLInputElement & { showPicker?: () => void };
    anyInput.showPicker?.();
    input.focus();
  }

  back(): void {
    this.router.navigateByUrl('/exams');
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const v = this.form.getRawValue();
    this.api
      .createExam({
        courseId: String(v.courseId),
        title: v.title ?? '',
        scheduledAt: v.scheduledAt ? new Date(v.scheduledAt).toISOString() : null,
        durationMinutes: Number(v.durationMinutes),
        maxScore: Number(v.maxScore),
        passingScore: Number(v.passingScore),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (exam) => {
          this.loading.set(false);
          this.snack.open('Exam created (DRAFT)', 'Dismiss', { duration: 2500 });
          this.router.navigate(['/exams', exam.id]);
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(err?.error?.message ?? 'Failed to create exam', 'Dismiss', {
            duration: 5000,
          });
        },
      });
  }
}
