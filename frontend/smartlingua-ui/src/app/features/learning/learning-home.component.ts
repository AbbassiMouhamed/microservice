import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-learning-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>My Learning</h1>
      <p>Manage your adaptive learning journey, track progress, and level up.</p>
    </div>

    <div class="cards-grid">
      <mat-card class="feature-card" routerLink="/learning/profile">
        <div class="card-icon profile">
          <mat-icon>person</mat-icon>
        </div>
        <h3>My Profile</h3>
        <p>View your current level, points, badges, and personalized recommendations.</p>
        <button mat-flat-button color="primary">View Profile</button>
      </mat-card>

      <mat-card class="feature-card" routerLink="/learning/path">
        <div class="card-icon path">
          <mat-icon>route</mat-icon>
        </div>
        <h3>Learning Path</h3>
        <p>Follow your AI-generated learning path tailored to your goals and level.</p>
        <button mat-stroked-button color="primary">View Path</button>
      </mat-card>

      <mat-card class="feature-card" routerLink="/learning/placement-test">
        <div class="card-icon test">
          <mat-icon>assignment</mat-icon>
        </div>
        <h3>Placement Test</h3>
        <p>Take the placement test to discover your level and unlock courses.</p>
        <button mat-stroked-button color="primary">Take Test</button>
      </mat-card>

      @if (auth.isTeacherOrAdmin) {
        <mat-card class="feature-card" routerLink="/learning/teacher">
          <div class="card-icon teacher">
            <mat-icon>dashboard</mat-icon>
          </div>
          <h3>Teacher Dashboard</h3>
          <p>Monitor student progress, view alerts, and manage learning outcomes.</p>
          <button mat-stroked-button color="primary">Open Dashboard</button>
        </mat-card>
      }
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
        &.profile {
          background: linear-gradient(135deg, #1565c0, #1976d2);
        }
        &.path {
          background: linear-gradient(135deg, #7c4dff, #651fff);
        }
        &.test {
          background: linear-gradient(135deg, #e65100, #f57c00);
        }
        &.teacher {
          background: linear-gradient(135deg, #2e7d32, #43a047);
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
export class LearningHomeComponent {
  readonly auth = inject(AuthService);
}
