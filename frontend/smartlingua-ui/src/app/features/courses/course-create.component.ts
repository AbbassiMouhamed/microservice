import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CourseApiService } from '../../services/course-api.service';
import { CourseLevel, CourseStatus } from '../../models';

@Component({
  selector: 'app-course-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <a mat-button routerLink="/courses"><mat-icon>arrow_back</mat-icon> Back to Courses</a>

    <div class="page-header">
      <h1>Create Course</h1>
      <p>Set up a new language learning course</p>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Course Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g. French for Beginners" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="4"
              placeholder="Describe the course content and objectives"
            ></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Level</mat-label>
              <mat-select formControlName="level">
                @for (l of levels; track l) {
                  <mat-option [value]="l">{{ l }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                @for (s of statuses; track s) {
                  <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Price</mat-label>
              <input matInput type="number" formControlName="price" placeholder="0.00" />
              <span matTextPrefix>$&nbsp;</span>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/courses">Cancel</button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading()"
            >
              <mat-icon>add</mat-icon> Create Course
            </button>
          </div>
        </form>
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
      .form-card {
        max-width: 800px;
        border-radius: 16px !important;
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
    `,
  ],
})
export class CourseCreateComponent {
  private readonly courseApi = inject(CourseApiService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly levels: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  readonly statuses: CourseStatus[] = ['PLANNED', 'ACTIVE', 'FINISHED'];
  loading = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    level: ['A1' as CourseLevel, Validators.required],
    status: ['PLANNED' as CourseStatus],
    price: [null as number | null],
    startDate: [null as Date | null],
    endDate: [null as Date | null],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const val = this.form.value;
    this.courseApi
      .createCourse({
        title: val.title!,
        description: val.description || '',
        level: val.level as CourseLevel,
        status: val.status as CourseStatus,
        price: val.price ?? null,
        startDate: val.startDate ? new Date(val.startDate).toISOString() : null,
        endDate: val.endDate ? new Date(val.endDate).toISOString() : null,
      })
      .subscribe({
        next: () => {
          this.snack.open('Course created successfully', 'OK', { duration: 3000 });
          this.router.navigate(['/courses']);
        },
        error: () => {
          this.snack.open('Failed to create course', 'OK', { duration: 3000 });
          this.loading.set(false);
        },
      });
  }
}
