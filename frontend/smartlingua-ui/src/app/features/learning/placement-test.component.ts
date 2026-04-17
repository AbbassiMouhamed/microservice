import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

import { AdaptiveApiService } from '../../services/adaptive-api.service';
import { PlacementTestResponse } from '../../models';

@Component({
  selector: 'app-placement-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule,
    MatSliderModule,
  ],
  template: `
    @switch (phase()) {
      @case ('intro') {
        <div class="intro-screen">
          <mat-icon class="big-icon">psychology</mat-icon>
          <h1>Placement Test</h1>
          <p>
            Assess your current language proficiency. Rate your skills honestly so we can create the
            best learning path for you.
          </p>
          <button mat-flat-button color="primary" (click)="phase.set('test')">
            <mat-icon>play_arrow</mat-icon> Begin Assessment
          </button>
        </div>
      }

      @case ('test') {
        <div class="test-container">
          <div class="test-header">
            <h2>Self-Assessment</h2>
            <p>Rate your overall language proficiency and identify areas to improve</p>
          </div>

          <mat-card class="q-card">
            <h3>How would you rate your overall language skill? (0–100)</h3>
            <div class="slider-row">
              <mat-slider min="0" max="100" step="5" discrete>
                <input matSliderThumb [(ngModel)]="score" />
              </mat-slider>
              <span class="score-display">{{ score }}</span>
            </div>
          </mat-card>

          <mat-card class="q-card">
            <h3>Which areas do you find most challenging?</h3>
            <div class="options">
              @for (area of weakAreaOptions; track area) {
                <label class="option-item" [class.selected]="selectedAreas().has(area)">
                  <mat-radio-button
                    [checked]="selectedAreas().has(area)"
                    (change)="toggleArea(area)"
                  ></mat-radio-button>
                  <span>{{ area }}</span>
                </label>
              }
            </div>
          </mat-card>

          <div class="nav-buttons">
            <button mat-button (click)="phase.set('intro')">
              <mat-icon>arrow_back</mat-icon> Back
            </button>
            <button mat-flat-button color="primary" (click)="submitTest()">
              <mat-icon>check</mat-icon> Submit Assessment
            </button>
          </div>
        </div>
      }

      @case ('loading') {
        <div class="intro-screen">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>Analyzing your proficiency...</p>
        </div>
      }

      @case ('result') {
        @if (result()) {
          <div class="result-screen">
            <div class="result-circle">
              <span class="result-level">{{ result()!.assignedLevel }}</span>
            </div>
            <h1>Your Level: {{ result()!.assignedLevel }}</h1>
            <p>
              {{
                result()!.insight || 'Your placement has been determined based on your assessment.'
              }}
            </p>
            <div class="result-actions">
              <a mat-flat-button color="primary" routerLink="/learning/path">
                <mat-icon>route</mat-icon> View Learning Path
              </a>
              <a mat-button routerLink="/learning/profile">View Profile</a>
            </div>
          </div>
        }
      }
    }
  `,
  styles: [
    `
      .intro-screen {
        text-align: center;
        padding: 80px 20px;
        max-width: 500px;
        margin: 0 auto;
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
          line-height: 1.5;
        }
      }

      .test-container {
        max-width: 700px;
        margin: 0 auto;
      }
      .test-header {
        margin-bottom: 20px;
        h2 {
          margin: 0 0 4px;
          font-size: 24px;
          font-weight: 600;
        }
        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.55);
        }
      }

      .q-card {
        border-radius: 16px !important;
        margin-bottom: 16px;
        h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 16px;
        }
      }
      .slider-row {
        display: flex;
        align-items: center;
        gap: 16px;
        mat-slider {
          flex: 1;
        }
      }
      .score-display {
        font-size: 24px;
        font-weight: 700;
        color: #1565c0;
        min-width: 48px;
        text-align: center;
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
        cursor: pointer;
        background: rgba(0, 0, 0, 0.02);
        border: 2px solid transparent;
        transition: all 0.15s;
        &:hover {
          background: rgba(21, 101, 192, 0.04);
        }
        &.selected {
          border-color: #1565c0;
          background: rgba(21, 101, 192, 0.06);
        }
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
          line-height: 1.5;
        }
      }
      .result-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto;
        background: linear-gradient(135deg, #1565c0, #7c4dff);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .result-level {
        font-size: 36px;
        font-weight: 700;
        color: white;
      }
      .result-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    `,
  ],
})
export class PlacementTestComponent {
  private readonly adaptiveApi = inject(AdaptiveApiService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  phase = signal<'intro' | 'test' | 'loading' | 'result'>('intro');
  result = signal<PlacementTestResponse | null>(null);
  score = 50;
  selectedAreas = signal<Set<string>>(new Set());
  weakAreaOptions = ['Reading', 'Writing', 'Listening', 'Speaking', 'Grammar', 'Vocabulary'];

  toggleArea(area: string): void {
    this.selectedAreas.update((s) => {
      const next = new Set(s);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  }

  submitTest(): void {
    this.phase.set('loading');
    const weakAreas = [...this.selectedAreas()].join(', ') || 'None';
    this.adaptiveApi.submitPlacementTest(this.score, weakAreas).subscribe({
      next: (data: PlacementTestResponse) => {
        this.result.set(data);
        this.phase.set('result');
      },
      error: () => {
        this.snack.open('Failed to submit assessment', 'OK', { duration: 3000 });
        this.phase.set('test');
      },
    });
  }
}
