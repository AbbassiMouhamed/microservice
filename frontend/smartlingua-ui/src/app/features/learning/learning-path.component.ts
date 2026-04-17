import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';

import { AdaptiveApiService } from '../../services/adaptive-api.service';
import { LearningPath, LearningPathItem } from '../../models';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatStepperModule],
  template: `
    <div class="page-header">
      <h1>My Learning Path</h1>
      <p>Your personalized journey to language mastery</p>
    </div>

    @if (path()) {
      <div class="path-overview">
        <mat-card class="overview-card">
          <div class="overview-row">
            <div class="overview-item">
              <mat-icon>flag</mat-icon>
              <span>Target: {{ path()!.targetLevel || 'Not set' }}</span>
            </div>
            <div class="overview-item">
              <mat-icon>check_circle</mat-icon>
              <span>{{ completedCount() }} / {{ path()!.items?.length || 0 }} completed</span>
            </div>
          </div>
        </mat-card>
      </div>

      <div class="timeline">
        @for (item of path()!.items || []; track item.id; let i = $index) {
          <div
            class="timeline-item"
            [class.completed]="item.status === 'DONE'"
            [class.current]="item.status !== 'DONE' && isNext(i)"
          >
            <div class="timeline-marker">
              @if (item.status === 'DONE') {
                <mat-icon>check_circle</mat-icon>
              } @else if (isNext(i)) {
                <mat-icon>play_circle</mat-icon>
              } @else {
                <mat-icon>radio_button_unchecked</mat-icon>
              }
            </div>
            <mat-card class="timeline-card">
              <h3>{{ item.title }}</h3>
              <div class="item-meta">
                @if (item.itemType) {
                  <span class="item-type">{{ item.itemType }}</span>
                }
                <span class="item-status">{{ item.status }}</span>
              </div>
            </mat-card>
          </div>
        }
      </div>
    } @else {
      <div class="empty-state">
        <mat-icon>route</mat-icon>
        <h3>No learning path yet</h3>
        <p>Take a placement test to generate your personalized learning path</p>
        <a mat-flat-button color="primary" routerLink="/learning/placement-test"
          >Take Placement Test</a
        >
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

      .overview-card {
        border-radius: 16px !important;
        margin-bottom: 24px;
      }
      .overview-row {
        display: flex;
        gap: 32px;
        flex-wrap: wrap;
      }
      .overview-item {
        display: flex;
        align-items: center;
        gap: 8px;
        mat-icon {
          color: #1565c0;
        }
        span {
          font-weight: 500;
        }
      }

      .timeline {
        position: relative;
        padding-left: 40px;
      }
      .timeline::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: rgba(0, 0, 0, 0.08);
      }
      .timeline-item {
        position: relative;
        margin-bottom: 16px;
      }
      .timeline-marker {
        position: absolute;
        left: -40px;
        top: 16px;
        width: 30px;
        display: flex;
        justify-content: center;
        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
      .completed .timeline-marker mat-icon {
        color: #4caf50;
      }
      .current .timeline-marker mat-icon {
        color: #1565c0;
      }
      .timeline-card {
        border-radius: 12px !important;
        h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }
        p {
          margin: 0 0 8px;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
        }
      }
      .current .timeline-card {
        border-left: 3px solid #1565c0;
      }
      .item-level,
      .item-type {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        margin-right: 6px;
      }
      .item-level {
        background: #e3f2fd;
        color: #1565c0;
      }
      .item-type {
        background: #f3e5f5;
        color: #7b1fa2;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        mat-icon {
          font-size: 56px;
          width: 56px;
          height: 56px;
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
export class LearningPathComponent implements OnInit {
  private readonly adaptiveApi = inject(AdaptiveApiService);
  path = signal<LearningPath | null>(null);

  completedCount = () => (this.path()?.items || []).filter((i) => i.status === 'DONE').length;

  isNext(index: number): boolean {
    const items = this.path()?.items || [];
    for (let i = 0; i < index; i++) {
      if (items[i].status !== 'DONE') return false;
    }
    return items[index].status !== 'DONE';
  }

  ngOnInit(): void {
    this.adaptiveApi
      .getMyLearningPath()
      .subscribe({ next: (p) => this.path.set(p), error: () => {} });
  }
}
