import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { QuizApiService } from '../../services/quiz-api.service';
import { QuizAttemptResult } from '../../models';

@Component({
  selector: 'app-quiz-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  template: `
    <div class="page-header">
      <h1>Quiz History</h1>
      <p>Review your past quiz attempts and scores</p>
    </div>

    <mat-card class="table-card">
      <mat-card-content>
        @if (attempts().length === 0) {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <h3>No quiz attempts yet</h3>
            <p>Take your first quiz to see your results here</p>
            <a mat-flat-button color="primary" routerLink="/quiz/take">Take a Quiz</a>
          </div>
        } @else {
          <table mat-table [dataSource]="attempts()" class="attempt-table">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let a">{{ a.startedAt | date: 'MMM d, y' }}</td>
            </ng-container>
            <ng-container matColumnDef="score">
              <th mat-header-cell *matHeaderCellDef>Score</th>
              <td mat-cell *matCellDef="let a">
                <span
                  class="score-badge"
                  [class.pass]="a.scorePercent >= 50"
                  [class.fail]="a.scorePercent < 50"
                >
                  {{ a.scorePercent | number: '1.0-0' }}%
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="correct">
              <th mat-header-cell *matHeaderCellDef>Correct</th>
              <td mat-cell *matCellDef="let a">{{ a.correctAnswers }} / {{ a.totalQuestions }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="status-chip">{{ a.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="weakAreas">
              <th mat-header-cell *matHeaderCellDef>Weak Areas</th>
              <td mat-cell *matCellDef="let a">{{ a.weakAreasAuto || '—' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        }
      </mat-card-content>
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
      .table-card {
        border-radius: 16px !important;
      }
      .attempt-table {
        width: 100%;
      }
      .score-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        &.pass {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.fail {
          background: #fce4ec;
          color: #c62828;
        }
      }
      .status-chip {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        background: #e3f2fd;
        color: #1565c0;
      }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: rgba(0, 0, 0, 0.15);
        }
        h3 {
          margin: 16px 0 8px;
        }
        p {
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
        }
      }
    `,
  ],
})
export class QuizHistoryComponent implements OnInit {
  private readonly quizApi = inject(QuizApiService);

  attempts = signal<QuizAttemptResult[]>([]);
  columns = ['date', 'score', 'correct', 'status', 'weakAreas'];

  ngOnInit(): void {
    this.quizApi.listMyAttempts().subscribe({
      next: (a) => this.attempts.set(a),
      error: () => {},
    });
  }
}
