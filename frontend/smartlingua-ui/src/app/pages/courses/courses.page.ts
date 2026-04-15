import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiClient } from '../../api/api-client.service';
import { Course } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-courses-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="page-title">Courses</div>
      <div class="page-subtitle">Intended users: Admin / Teacher (static user mode)</div>
    </div>

    <div class="grid">
      <mat-card>
        <mat-card-title>Course list</mat-card-title>
        <mat-card-content>
          <table mat-table [dataSource]="courses()" class="table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let c">{{ c.title }}</td>
            </ng-container>

            <ng-container matColumnDef="level">
              <th mat-header-cell *matHeaderCellDef>Level</th>
              <td mat-cell *matCellDef="let c">{{ c.level || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="startDate">
              <th mat-header-cell *matHeaderCellDef>Start</th>
              <td mat-cell *matCellDef="let c">{{ formatDate(c.startDate) }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>Create course</mat-card-title>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Level (optional)</mat-label>
              <input matInput formControlName="level" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Start date (optional)</mat-label>
              <input
                #startDateInput
                matInput
                type="datetime-local"
                formControlName="startDate"
                (click)="openNativePicker(startDateInput)"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                aria-label="Open date and time picker"
                (click)="openNativePicker(startDateInput)"
              >
                <mat-icon>event</mat-icon>
              </button>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
            >
              Create
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 16px;
        align-items: start;
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
      .table {
        width: 100%;
      }
      .form {
        display: grid;
        gap: 12px;
      }
      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CoursesPage {
  private readonly api = inject(ApiClient);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly courses = signal<Course[]>([]);
  readonly loading = signal(false);

  readonly displayedColumns = ['title', 'level', 'startDate'];

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    level: [''],
    startDate: [''],
  });

  constructor() {
    this.refresh();
  }

  openNativePicker(input: HTMLInputElement): void {
    const anyInput = input as HTMLInputElement & { showPicker?: () => void };
    anyInput.showPicker?.();
    input.focus();
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'medium') ?? value;
  }

  refresh(): void {
    this.api
      .listCourses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.courses.set(data),
        error: () => this.snack.open('Failed to load courses', 'Dismiss', { duration: 4000 }),
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const v = this.form.getRawValue();

    this.api
      .createCourse({
        title: v.title ?? '',
        level: v.level || null,
        startDate: v.startDate ? new Date(v.startDate).toISOString() : null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.form.reset({ title: '', level: '', startDate: '' });
          this.snack.open('Course created', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(err?.error?.message ?? 'Failed to create course', 'Dismiss', {
            duration: 5000,
          });
        },
      });
  }
}
