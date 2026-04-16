import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
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
    MatTableModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="page-title">Exams</div>
      <div class="page-subtitle">Intended users: Teacher (static user mode)</div>
    </div>

    <mat-card>
      <mat-card-title class="title-row">
        <span>Final exams</span>
        <span class="spacer"></span>
        <a *ngIf="auth.isTeacherOrAdmin" mat-raised-button color="primary" routerLink="/exams/new">
          <mat-icon>add</mat-icon>
          Create exam
        </a>
      </mat-card-title>

      <mat-card-content>
        <table mat-table [dataSource]="exams()" class="table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let e">
              <a [routerLink]="['/exams', e.id]">{{ e.title }}</a>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let e">{{ e.status }}</td>
          </ng-container>

          <ng-container matColumnDef="scheduledAt">
            <th mat-header-cell *matHeaderCellDef>Scheduled</th>
            <td mat-cell *matCellDef="let e">{{ formatDate(e.scheduledAt) }}</td>
          </ng-container>

          <ng-container matColumnDef="maxScore">
            <th mat-header-cell *matHeaderCellDef>Max</th>
            <td mat-cell *matCellDef="let e">{{ e.maxScore }}</td>
          </ng-container>

          <ng-container matColumnDef="passingScore">
            <th mat-header-cell *matHeaderCellDef>Pass</th>
            <td mat-cell *matCellDef="let e">{{ e.passingScore }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let e" class="row-actions">
              <button
                *ngIf="auth.isTeacherOrAdmin"
                mat-button
                color="warn"
                type="button"
                (click)="deleteExam(e)"
              >
                Delete
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .table {
        width: 100%;
      }
      .row-actions {
        display: flex;
        justify-content: flex-end;
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
  readonly displayedColumns = this.auth.isTeacherOrAdmin
    ? ['title', 'status', 'scheduledAt', 'maxScore', 'passingScore', 'actions']
    : ['title', 'status', 'scheduledAt', 'maxScore', 'passingScore'];

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
