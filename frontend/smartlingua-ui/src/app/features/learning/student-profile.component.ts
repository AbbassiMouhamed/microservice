import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

import { AdaptiveApiService } from '../../services/adaptive-api.service';
import { AdaptiveProfile, AdaptiveProgress } from '../../models';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-header">
      <h1>My Learning Profile</h1>
      <p>Track your progress and language proficiency</p>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <mat-icon>hourglass_empty</mat-icon>
        <p>Loading profile...</p>
      </div>
    } @else if (!profile()) {
      <mat-card class="empty-profile-card">
        <div class="empty-profile">
          <mat-icon class="empty-icon">school</mat-icon>
          <h2>No Learning Profile Yet</h2>
          <p>Take the placement test to discover your level and unlock personalized learning.</p>
          <a mat-flat-button color="primary" routerLink="/learning/placement-test">
            <mat-icon>assignment</mat-icon> Take Placement Test
          </a>
        </div>
      </mat-card>
    } @else {
      <div class="profile-grid">
        <mat-card class="level-card">
          <div class="level-circle">
            <span class="level-text">{{ profile()!.currentLevel || '—' }}</span>
          </div>
          <h3>Current Level</h3>
          <p class="level-desc">{{ profile()!.learningGoal || 'Set your learning goals' }}</p>
          <a mat-stroked-button routerLink="/learning/placement-test" class="test-btn">
            <mat-icon>assignment</mat-icon> Take Level Test
          </a>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon class="stat-icon">stars</mat-icon>
          <div class="stat-value">{{ profile()!.gamificationPoints || 0 }}</div>
          <div class="stat-label">Points</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">emoji_events</mat-icon>
          <div class="stat-value">{{ profile()!.targetLevel || '—' }}</div>
          <div class="stat-label">Target Level</div>
        </mat-card>
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">local_fire_department</mat-icon>
          <div class="stat-value">{{ profile()!.recommendations?.length || 0 }}</div>
          <div class="stat-label">Recommendations</div>
        </mat-card>
      </div>

      @if (progress()) {
        <h2 class="section-title">Skill Progress</h2>
        <div class="skills-grid">
          @for (skill of skillEntries(); track skill.name) {
            <mat-card class="skill-card">
              <div class="skill-header">
                <mat-icon>{{ skill.icon }}</mat-icon>
                <span>{{ skill.name }}</span>
              </div>
              <mat-progress-bar mode="determinate" [value]="skill.value"></mat-progress-bar>
              <span class="skill-pct">{{ skill.value }}%</span>
            </mat-card>
          }
        </div>
      }

      <div class="actions">
        <a mat-flat-button color="primary" routerLink="/learning/path">
          <mat-icon>route</mat-icon> View Learning Path
        </a>
      </div>
    }
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

      .profile-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 16px;
        margin-bottom: 32px;
      }
      @media (max-width: 900px) {
        .profile-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 600px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }
      }

      .level-card {
        border-radius: 16px !important;
        text-align: center;
        padding: 28px;
        background: linear-gradient(135deg, #1565c0, #1976d2) !important;
        color: white;
        h3 {
          margin: 12px 0 4px;
          font-size: 16px;
        }
      }
      .level-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0 auto;
        border: 3px solid rgba(255, 255, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .level-text {
        font-size: 28px;
        font-weight: 700;
      }
      .level-desc {
        font-size: 13px;
        opacity: 0.8;
        margin-bottom: 16px;
      }
      .test-btn {
        color: white !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
      }

      .stat-card {
        border-radius: 16px !important;
        text-align: center;
        padding: 24px;
      }
      .stat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #1565c0;
      }
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        margin: 8px 0 4px;
        color: #1a1a2e;
      }
      .stat-label {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 16px;
      }
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }
      .skill-card {
        border-radius: 12px !important;
        padding: 16px;
      }
      .skill-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        mat-icon {
          color: #1565c0;
        }
        span {
          font-weight: 500;
        }
      }
      .skill-pct {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 6px;
        display: block;
      }

      .actions {
        margin-top: 24px;
      }

      .loading-state {
        text-align: center;
        padding: 60px 20px;
        color: rgba(0, 0, 0, 0.4);
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
        }
        p {
          font-size: 15px;
        }
      }

      .empty-profile-card {
        border-radius: 16px !important;
        max-width: 520px;
        margin: 40px auto;
      }
      .empty-profile {
        text-align: center;
        padding: 48px 24px;
        .empty-icon {
          font-size: 56px;
          width: 56px;
          height: 56px;
          color: #1565c0;
          margin-bottom: 12px;
        }
        h2 {
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 8px;
          color: #1a1a2e;
        }
        p {
          color: rgba(0, 0, 0, 0.55);
          margin: 0 0 24px;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }
      }
    `,
  ],
})
export class StudentProfileComponent implements OnInit {
  private readonly adaptiveApi = inject(AdaptiveApiService);

  profile = signal<AdaptiveProfile | null>(null);
  progress = signal<AdaptiveProgress | null>(null);
  loading = signal(true);

  skillEntries = () => {
    const p = this.progress();
    if (!p) return [];
    return [
      {
        name: 'Completed',
        value: Math.round((p.completedItems / (p.totalItems || 1)) * 100),
        icon: 'check_circle',
      },
      { name: 'Overall', value: p.completionPercentage ?? 0, icon: 'trending_up' },
    ];
  };

  ngOnInit(): void {
    this.adaptiveApi
      .getMyProfile()
      .subscribe({
        next: (p) => this.profile.set(p),
        error: () => {},
        complete: () => this.loading.set(false),
      });
    this.adaptiveApi
      .getMyProgress()
      .subscribe({ next: (p) => this.progress.set(p), error: () => {} });
  }
}
