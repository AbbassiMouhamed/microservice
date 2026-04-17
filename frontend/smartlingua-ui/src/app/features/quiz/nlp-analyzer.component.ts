import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

import { QuizApiService } from '../../services/quiz-api.service';
import { NlpAnalyzeResponse } from '../../models';

@Component({
  selector: 'app-nlp-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-header">
      <h1>Text Analyzer</h1>
      <p>AI-powered language analysis and grammar checking</p>
    </div>

    <div class="analyzer-layout">
      <mat-card class="input-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="card-icon">edit_note</mat-icon>
          <mat-card-title>Your Text</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Language</mat-label>
            <mat-select [(value)]="language">
              @for (l of languages; track l.value) {
                <mat-option [value]="l.value">{{ l.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Enter text to analyze</mat-label>
            <textarea
              matInput
              [(ngModel)]="text"
              rows="8"
              placeholder="Type or paste your text here..."
            ></textarea>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button
            mat-flat-button
            color="primary"
            (click)="analyze()"
            [disabled]="!text || loading()"
          >
            <mat-icon>spellcheck</mat-icon> Analyze Text
          </button>
        </mat-card-actions>
        @if (loading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
      </mat-card>

      @if (result()) {
        <mat-card class="result-card">
          <mat-card-header>
            <mat-icon mat-card-avatar class="card-icon">analytics</mat-icon>
            <mat-card-title>Analysis Results</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="result-stats">
              <div class="stat-item">
                <span
                  class="stat-value"
                  [class.good]="result()!.score >= 80"
                  [class.mid]="result()!.score >= 50 && result()!.score < 80"
                  [class.bad]="result()!.score < 50"
                >
                  {{ result()!.score }}/100
                </span>
                <span class="stat-label">Score</span>
              </div>
              <div class="stat-item">
                <span
                  class="stat-value"
                  [class.good]="result()!.errorsCount === 0"
                  [class.bad]="result()!.errorsCount > 0"
                >
                  {{ result()!.errorsCount }}
                </span>
                <span class="stat-label">Errors Found</span>
              </div>
            </div>

            @if (result()!.correctedText) {
              <div class="corrected-section">
                <h3>Corrected Text</h3>
                <div class="corrected-text">{{ result()!.correctedText }}</div>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
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

      .analyzer-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      @media (max-width: 900px) {
        .analyzer-layout {
          grid-template-columns: 1fr;
        }
      }

      .input-card,
      .result-card {
        border-radius: 16px !important;
      }
      .card-icon {
        background: rgba(21, 101, 192, 0.08);
        color: #1565c0;
        border-radius: 12px;
      }
      .full-width {
        width: 100%;
      }

      .result-stats {
        display: flex;
        gap: 24px;
        margin-bottom: 20px;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.02);
        flex: 1;
      }
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        &.good {
          color: #2e7d32;
        }
        &.mid {
          color: #e65100;
        }
        &.bad {
          color: #c62828;
        }
      }
      .stat-label {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 4px;
      }

      .corrected-section {
        h3 {
          font-size: 14px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.6);
          margin: 0 0 8px;
        }
      }
      .corrected-text {
        padding: 16px;
        border-radius: 10px;
        background: #e8f5e9;
        font-size: 15px;
        line-height: 1.6;
        color: #1b5e20;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class NlpAnalyzerComponent {
  private readonly quizApi = inject(QuizApiService);

  text = '';
  language = 'en';
  loading = signal(false);
  result = signal<NlpAnalyzeResponse | null>(null);

  languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'de', label: 'German' },
    { value: 'ar', label: 'Arabic' },
  ];

  analyze(): void {
    if (!this.text.trim()) return;
    this.loading.set(true);
    this.result.set(null);
    this.quizApi.analyzeText(this.text, this.language).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
