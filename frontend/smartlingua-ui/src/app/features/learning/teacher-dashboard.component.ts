import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../auth/auth.service';
import { AdaptiveApiService } from '../../services/adaptive-api.service';
import { TeacherDashboard, LearnerEntry, AdaptiveAlert } from '../../models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-header">
      <h1>Teacher Dashboard</h1>
      <p>Monitor student progress and learning analytics</p>
    </div>

    @if (dashboard()) {
      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon>group</mat-icon>
          <div class="stat-val">{{ dashboard()!.totalStudents }}</div>
          <div class="stat-lbl">Total Students</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>trending_up</mat-icon>
          <div class="stat-val">{{ dashboard()!.activePaths }}</div>
          <div class="stat-lbl">Active Paths</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>warning</mat-icon>
          <div class="stat-val">{{ dashboard()!.openAlerts }}</div>
          <div class="stat-lbl">Alerts</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon>school</mat-icon>
          <div class="stat-val">{{ dashboard()!.avgCompletionPercent | number: '1.0-0' }}%</div>
          <div class="stat-lbl">Avg Progress</div>
        </mat-card>
      </div>

      <!-- Alerts -->
      @if (dashboard()!.latestAlerts?.length) {
        <h2 class="section-title">Alerts</h2>
        <div class="alerts-list">
          @for (alert of dashboard()!.latestAlerts; track alert.id) {
            <mat-card class="alert-card" [class.critical]="alert.severity === 'HIGH'">
              <div class="alert-content">
                <mat-icon class="alert-icon">{{
                  alert.severity === 'HIGH' ? 'error' : 'warning'
                }}</mat-icon>
                <div class="alert-info">
                  <strong>{{ alert.studentName }}</strong>
                  <span>{{ alert.reason }}</span>
                </div>
                <button mat-button color="primary" (click)="resolveAlert(alert.id)">Resolve</button>
              </div>
            </mat-card>
          }
        </div>
      }
    }

    <!-- Learners Table -->
    <h2 class="section-title">Learners</h2>
    <mat-card class="table-card">
      @if (learners().length > 0) {
        <table mat-table [dataSource]="learners()" class="learner-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Student</th>
            <td mat-cell *matCellDef="let l">{{ l.name }}</td>
          </ng-container>
          <ng-container matColumnDef="level">
            <th mat-header-cell *matHeaderCellDef>Level</th>
            <td mat-cell *matCellDef="let l">
              <span class="level-chip">{{ l.currentLevel }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="progress">
            <th mat-header-cell *matHeaderCellDef>Progress</th>
            <td mat-cell *matCellDef="let l">{{ l.overallProgress | number: '1.0-0' }}%</td>
          </ng-container>
          <ng-container matColumnDef="lastActive">
            <th mat-header-cell *matHeaderCellDef>Last Active</th>
            <td mat-cell *matCellDef="let l">{{ l.lastActiveAt | date: 'MMM d' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="learnerCols"></tr>
          <tr mat-row *matRowDef="let row; columns: learnerCols"></tr>
        </table>
      } @else {
        <div class="empty">
          <p>No learners found</p>
        </div>
      }
    </mat-card>
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

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 32px;
      }
      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .stat-card {
        border-radius: 16px !important;
        text-align: center;
        padding: 24px;
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: #1565c0;
        }
      }
      .stat-val {
        font-size: 28px;
        font-weight: 700;
        margin: 8px 0 2px;
        color: #1a1a2e;
      }
      .stat-lbl {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 16px;
      }
      .alerts-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 24px;
      }
      .alert-card {
        border-radius: 12px !important;
        &.critical {
          border-left: 3px solid #c62828;
        }
      }
      .alert-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .alert-icon {
        color: #e65100;
      }
      .critical .alert-icon {
        color: #c62828;
      }
      .alert-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        strong {
          font-size: 14px;
        }
        span {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.55);
        }
      }

      .table-card {
        border-radius: 16px !important;
        overflow: hidden;
      }
      .learner-table {
        width: 100%;
      }
      .level-chip {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        background: #e3f2fd;
        color: #1565c0;
      }
      .empty {
        text-align: center;
        padding: 40px;
        color: rgba(0, 0, 0, 0.4);
      }
    `,
  ],
})
export class TeacherDashboardComponent implements OnInit {
  private readonly adaptiveApi = inject(AdaptiveApiService);
  private readonly snack = inject(MatSnackBar);

  dashboard = signal<TeacherDashboard | null>(null);
  learners = signal<LearnerEntry[]>([]);
  learnerCols = ['name', 'email'];

  ngOnInit(): void {
    this.adaptiveApi
      .getTeacherDashboard()
      .subscribe({ next: (d) => this.dashboard.set(d), error: () => {} });
    this.adaptiveApi
      .listLearners()
      .subscribe({ next: (l: LearnerEntry[]) => this.learners.set(l), error: () => {} });
  }

  resolveAlert(id: number): void {
    this.adaptiveApi.resolveAlert(id).subscribe({
      next: () => {
        this.snack.open('Alert resolved', 'OK', { duration: 2000 });
        this.dashboard.update((d) =>
          d
            ? {
                ...d,
                latestAlerts: d.latestAlerts?.filter((a: AdaptiveAlert) => a.id !== id),
                openAlerts: d.openAlerts - 1,
              }
            : d,
        );
      },
    });
  }
}
