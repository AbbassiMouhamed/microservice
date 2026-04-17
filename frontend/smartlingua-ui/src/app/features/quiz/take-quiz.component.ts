import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { QuizApiService } from '../../services/quiz-api.service';
import { Question, QuizAttemptResult, AnswerSubmission } from '../../models';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule,
  ],
  template: `
    @switch (phase()) {
      @case ('start') {
        <div class="start-screen">
          <mat-icon class="big-icon">quiz</mat-icon>
          <h1>Ready for a Quiz?</h1>
          <p>Test your language skills with a personalized quiz</p>
          <button mat-flat-button color="primary" (click)="startQuiz()">
            <mat-icon>play_arrow</mat-icon> Start Quiz
          </button>
        </div>
      }

      @case ('loading') {
        <div class="start-screen">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>Preparing your quiz...</p>
        </div>
      }

      @case ('quiz') {
        <div class="quiz-container">
          <div class="quiz-header">
            <span>Question {{ currentIndex() + 1 }} of {{ questions().length }}</span>
            <mat-progress-bar
              mode="determinate"
              [value]="((currentIndex() + 1) / questions().length) * 100"
            ></mat-progress-bar>
          </div>

          @if (currentQuestion()) {
            <mat-card class="question-card">
              <mat-card-content>
                <div class="question-meta">
                  <span class="q-level">{{ currentQuestion()!.level }}</span>
                  <span class="q-skill">{{ currentQuestion()!.skillType }}</span>
                </div>
                <h2 class="question-text">{{ currentQuestion()!.questionText }}</h2>
                <div class="options">
                  @for (opt of ['A', 'B', 'C', 'D']; track opt) {
                    @if (getOption(opt)) {
                      <label
                        class="option-item"
                        [class.selected]="answers()[currentQuestion()!.id] === opt"
                      >
                        <mat-radio-button
                          [value]="opt"
                          [checked]="answers()[currentQuestion()!.id] === opt"
                          (change)="selectAnswer(currentQuestion()!.id, opt)"
                        ></mat-radio-button>
                        <span class="option-label">{{ opt }}.</span>
                        <span>{{ getOption(opt) }}</span>
                      </label>
                    }
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <div class="nav-buttons">
              <button mat-button [disabled]="currentIndex() === 0" (click)="prev()">
                <mat-icon>navigate_before</mat-icon> Previous
              </button>
              @if (currentIndex() < questions().length - 1) {
                <button mat-flat-button color="primary" (click)="next()">
                  Next <mat-icon>navigate_next</mat-icon>
                </button>
              } @else {
                <button mat-flat-button color="primary" (click)="submitQuiz()">
                  <mat-icon>check</mat-icon> Submit Quiz
                </button>
              }
            </div>
          }
        </div>
      }

      @case ('result') {
        @if (result()) {
          <div class="result-screen">
            <div
              class="result-circle"
              [class.pass]="(result()!.scorePercent ?? 0) >= 50"
              [class.fail]="(result()!.scorePercent ?? 0) < 50"
            >
              <span class="result-score">{{ result()!.scorePercent ?? 0 | number: '1.0-0' }}%</span>
            </div>
            <h1>{{ (result()!.scorePercent ?? 0) >= 50 ? 'Well Done!' : 'Keep Practicing!' }}</h1>
            <p>{{ result()!.correctAnswers }} out of {{ result()!.totalQuestions }} correct</p>

            @if (result()!.weakAreasAuto) {
              <div class="weak-areas">
                <h3>Areas to Improve</h3>
                <p>{{ result()!.weakAreasAuto }}</p>
              </div>
            }

            <div class="result-actions">
              <button mat-flat-button color="primary" (click)="resetQuiz()">
                <mat-icon>replay</mat-icon> Take Another Quiz
              </button>
              <button mat-button routerLink="/quiz/history">View History</button>
            </div>
          </div>
        }
      }
    }
  `,
  styles: [
    `
      .start-screen {
        text-align: center;
        padding: 80px 20px;
        .big-icon {
          font-size: 80px;
          width: 80px;
          height: 80px;
          color: #1565c0;
        }
        h1 {
          font-size: 32px;
          font-weight: 600;
          margin: 16px 0 8px;
        }
        p {
          color: rgba(0, 0, 0, 0.55);
          margin-bottom: 24px;
        }
      }

      .quiz-container {
        max-width: 700px;
        margin: 0 auto;
      }
      .quiz-header {
        margin-bottom: 20px;
        span {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.55);
          display: block;
          margin-bottom: 8px;
        }
      }

      .question-card {
        border-radius: 16px !important;
      }
      .question-meta {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .q-level,
      .q-skill {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      .q-level {
        background: #e3f2fd;
        color: #1565c0;
      }
      .q-skill {
        background: #f3e5f5;
        color: #7b1fa2;
      }
      .question-text {
        font-size: 20px;
        font-weight: 500;
        margin: 0 0 24px;
        line-height: 1.4;
      }

      .options {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .option-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 12px;
        border: 2px solid transparent;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.02);
        transition: all 0.15s;
        &:hover {
          background: rgba(21, 101, 192, 0.04);
        }
        &.selected {
          border-color: #1565c0;
          background: rgba(21, 101, 192, 0.06);
        }
      }
      .option-label {
        font-weight: 600;
        color: rgba(0, 0, 0, 0.4);
        min-width: 20px;
      }

      .nav-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }

      .result-screen {
        text-align: center;
        padding: 60px 20px;
        max-width: 500px;
        margin: 0 auto;
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 20px 0 8px;
        }
        p {
          color: rgba(0, 0, 0, 0.55);
          margin-bottom: 24px;
        }
      }
      .result-circle {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        &.pass {
          background: #e8f5e9;
        }
        &.fail {
          background: #fce4ec;
        }
      }
      .result-score {
        font-size: 36px;
        font-weight: 700;
      }
      .pass .result-score {
        color: #2e7d32;
      }
      .fail .result-score {
        color: #c62828;
      }
      .weak-areas {
        padding: 16px;
        border-radius: 12px;
        background: #fff8e1;
        text-align: left;
        h3 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
        }
        p {
          margin: 0;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.7);
        }
      }
      .result-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 24px;
      }
    `,
  ],
})
export class TakeQuizComponent {
  private readonly quizApi = inject(QuizApiService);
  private readonly snack = inject(MatSnackBar);

  phase = signal<'start' | 'loading' | 'quiz' | 'result'>('start');
  questions = signal<Question[]>([]);
  currentIndex = signal(0);
  answers = signal<Record<number, string>>({});
  attemptId = signal<number>(0);
  result = signal<QuizAttemptResult | null>(null);

  currentQuestion = () => this.questions()[this.currentIndex()] ?? null;

  getOption(key: string): string | null {
    const q = this.currentQuestion();
    if (!q) return null;
    switch (key) {
      case 'A':
        return q.optionA;
      case 'B':
        return q.optionB;
      case 'C':
        return q.optionC;
      case 'D':
        return q.optionD;
      default:
        return null;
    }
  }

  startQuiz(): void {
    this.phase.set('loading');
    this.quizApi.startAttempt().subscribe({
      next: (attempt) => {
        this.attemptId.set(attempt.id);
        this.quizApi.listQuestions().subscribe({
          next: (questions) => {
            this.questions.set(questions);
            this.currentIndex.set(0);
            this.answers.set({});
            this.phase.set('quiz');
          },
          error: () => {
            this.snack.open('Failed to load questions', 'OK', { duration: 3000 });
            this.phase.set('start');
          },
        });
      },
      error: () => {
        this.snack.open('Failed to start quiz', 'OK', { duration: 3000 });
        this.phase.set('start');
      },
    });
  }

  selectAnswer(questionId: number, answer: string): void {
    this.answers.update((a) => ({ ...a, [questionId]: answer }));
  }

  prev(): void {
    this.currentIndex.update((i) => Math.max(0, i - 1));
  }

  next(): void {
    this.currentIndex.update((i) => Math.min(this.questions().length - 1, i + 1));
  }

  submitQuiz(): void {
    const submissions: AnswerSubmission[] = Object.entries(this.answers()).map(([qId, ans]) => ({
      questionId: Number(qId),
      selectedAnswer: ans,
    }));
    this.quizApi.completeAttempt(this.attemptId(), submissions).subscribe({
      next: (r) => {
        this.result.set(r);
        this.phase.set('result');
      },
      error: () => this.snack.open('Failed to submit quiz', 'OK', { duration: 3000 }),
    });
  }

  resetQuiz(): void {
    this.phase.set('start');
    this.questions.set([]);
    this.currentIndex.set(0);
    this.answers.set({});
    this.result.set(null);
  }
}
