import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">Create exam</div>
      <div class="page-subtitle">Intended users: Teacher (static user mode)</div>
    </div>

    <mat-card>
      <mat-card-title>Create exam</mat-card-title>
      <mat-card-content>
        <p class="hint">
          Create a final exam for a course. You can publish it later to accept attempts.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Course</mat-label>
            <mat-select formControlName="courseId">
              @for (c of courses(); track c.id) {
                <mat-option [value]="c.id">{{ c.title }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          <mat-form-field appearance="outline">
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

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="durationMinutes" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Max score</mat-label>
              <input matInput type="number" formControlName="maxScore" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Passing score</mat-label>
              <input matInput type="number" formControlName="passingScore" />
            </mat-form-field>
          </div>

          <div class="actions">
            <button mat-button type="button" (click)="back()">Cancel</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
            >
              Create
            </button>
          </div>
        </form>

        <mat-card *ngIf="courses().length === 0" class="warn">
          <mat-card-content>
            No courses yet. Create one in the Courses section first.
          </mat-card-content>
        </mat-card>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .hint {
        margin-top: 0;
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
      .form {
        display: grid;
        gap: 12px;
      }
      .row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }
      .warn {
        margin-top: 16px;
      }
      @media (max-width: 900px) {
        .row {
          grid-template-columns: 1fr;
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
