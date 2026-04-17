import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-quiz-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>Quizzes</h1>
      <p>Test your knowledge, track your performance, and improve your skills.</p>
    </div>

    <div class="cards-grid">
      <mat-card class="feature-card" routerLink="/quiz/take">
        <div class="card-icon take">
          <mat-icon>play_circle</mat-icon>
        </div>
        <h3>Take a Quiz</h3>
        <p>Start a new quiz to test your language skills at your current level.</p>
        <button mat-flat-button color="primary">Start Quiz</button>
      </mat-card>

      <mat-card class="feature-card" routerLink="/quiz/history">
        <div class="card-icon history">
          <mat-icon>history</mat-icon>
        </div>
        <h3>Quiz History</h3>
        <p>Review your past quiz attempts, scores, and areas for improvement.</p>
        <button mat-stroked-button color="primary">View History</button>
      </mat-card>

      @if (auth.isTeacherOrAdmin) {
        <mat-card class="feature-card" routerLink="/quiz/questions">
          <div class="card-icon bank">
            <mat-icon>storage</mat-icon>
          </div>
          <h3>Question Bank</h3>
          <p>Manage questions, create new ones, and organize by level and skill.</p>
          <button mat-stroked-button color="primary">Manage Questions</button>
        </mat-card>
      }

      <mat-card class="feature-card" routerLink="/quiz/nlp">
        <div class="card-icon nlp">
          <mat-icon>spellcheck</mat-icon>
        </div>
        <h3>Text Analyzer</h3>
        <p>Analyze your writing for grammar, spelling, and get an accuracy score.</p>
        <button mat-stroked-button color="primary">Analyze Text</button>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 28px;
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 6px;
          color: #1a1a2e;
        }
        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.55);
          font-size: 15px;
        }
      }

      .cards-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      .feature-card {
        flex: 1 1 280px;
        border-radius: 16px !important;
        padding: 28px;
        cursor: pointer;
        transition:
          box-shadow 0.2s,
          transform 0.2s;
        display: flex;
        flex-direction: column;
        gap: 12px;

        &:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
        }
        p {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.55);
          margin: 0;
          flex: 1;
          line-height: 1.5;
        }
      }

      .card-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: white;
        }
        &.take {
          background: linear-gradient(135deg, #1565c0, #1976d2);
        }
        &.history {
          background: linear-gradient(135deg, #7c4dff, #651fff);
        }
        &.bank {
          background: linear-gradient(135deg, #2e7d32, #43a047);
        }
        &.nlp {
          background: linear-gradient(135deg, #e65100, #f57c00);
        }
      }

      @media (max-width: 600px) {
        .cards-grid {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class QuizHomeComponent {
  readonly auth = inject(AuthService);
}
