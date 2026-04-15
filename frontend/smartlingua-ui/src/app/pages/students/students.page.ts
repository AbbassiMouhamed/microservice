import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiClient } from '../../api/api-client.service';
import { User, UserType } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-students-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">Users</div>
      <div class="page-subtitle">Intended users: Admin (static user mode)</div>
    </div>

    <div class="grid">
      <mat-card>
        <mat-card-title>Students</mat-card-title>
        <mat-card-content>
          <table mat-table [dataSource]="students()" class="table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.name }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>Create user</mat-card-title>
        <mat-card-content>
          <p class="hint">
            In this demo UI, you primarily create <strong>STUDENT</strong> users to submit exam
            attempts.
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>User type</mat-label>
              <mat-select formControlName="userType">
                <mat-option value="STUDENT">Student</mat-option>
                <mat-option value="TEACHER">Teacher</mat-option>
                <mat-option value="ADMIN">Admin</mat-option>
              </mat-select>
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
      .hint {
        margin-top: 0;
        opacity: 0.85;
      }
      @media (max-width: 900px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StudentsPage {
  private readonly api = inject(ApiClient);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly students = signal<User[]>([]);
  readonly loading = signal(false);

  readonly displayedColumns = ['name', 'email'];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    userType: ['STUDENT' as UserType, [Validators.required]],
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.api
      .listUsers('STUDENT')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.students.set(data),
        error: () => this.snack.open('Failed to load students', 'Dismiss', { duration: 4000 }),
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const v = this.form.getRawValue();

    this.api
      .createUser({
        name: v.name ?? '',
        email: v.email ?? '',
        userType: (v.userType ?? 'STUDENT') as UserType,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.form.reset({ name: '', email: '', userType: 'STUDENT' });
          this.snack.open('User created', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) => {
          this.loading.set(false);
          this.snack.open(err?.error?.message ?? 'Failed to create user', 'Dismiss', {
            duration: 5000,
          });
        },
      });
  }
}
