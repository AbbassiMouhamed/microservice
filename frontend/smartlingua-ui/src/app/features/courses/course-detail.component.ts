import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';

import { AuthService } from '../../auth/auth.service';
import { CourseApiService } from '../../services/course-api.service';
import { Course, Chapter, Resource, Seance } from '../../models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatExpansionModule,
  ],
  template: `
    <div class="header-row">
      <a mat-button routerLink="/courses"><mat-icon>arrow_back</mat-icon> Back to Courses</a>
    </div>

    @if (course()) {
      <div class="course-header">
        <div class="course-title-section">
          <h1>{{ course()!.title }}</h1>
          <div class="course-badges">
            <span class="level-badge" [class]="'level-' + course()!.level?.toLowerCase()">{{
              course()!.level
            }}</span>
            <span class="status-badge" [class]="'status-' + course()!.status?.toLowerCase()">{{
              course()!.status
            }}</span>
          </div>
          <p class="description">{{ course()!.description || 'No description available' }}</p>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms">
        <!-- Chapters Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>menu_book</mat-icon>&nbsp;Chapters ({{ chapters().length }})
          </ng-template>
          <div class="tab-content">
            @if (chapters().length === 0) {
              <div class="empty-tab">
                <mat-icon>menu_book</mat-icon>
                <p>No chapters yet</p>
              </div>
            } @else {
              <mat-accordion multi>
                @for (ch of chapters(); track ch.id) {
                  <mat-expansion-panel>
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <span class="chapter-order">{{ ch.orderIndex + 1 }}</span>
                        {{ ch.title }}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ ch.skillType }} · {{ ch.contents?.length || 0 }} items
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    <p>{{ ch.description }}</p>
                    @if (ch.contents && ch.contents.length > 0) {
                      <mat-list>
                        @for (c of ch.contents; track c.id) {
                          <mat-list-item>
                            <mat-icon matListItemIcon>
                              {{
                                c.type === 'VIDEO'
                                  ? 'play_circle'
                                  : c.type === 'PDF'
                                    ? 'picture_as_pdf'
                                    : c.type === 'AUDIO'
                                      ? 'headphones'
                                      : 'event'
                              }}
                            </mat-icon>
                            <span matListItemTitle>{{ c.title }}</span>
                            <span matListItemLine
                              >{{ c.type }}{{ c.required ? ' · Required' : '' }}</span
                            >
                          </mat-list-item>
                        }
                      </mat-list>
                    }
                  </mat-expansion-panel>
                }
              </mat-accordion>
            }
          </div>
        </mat-tab>

        <!-- Resources Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>folder</mat-icon>&nbsp;Resources ({{ resources().length }})
          </ng-template>
          <div class="tab-content">
            @if (resources().length === 0) {
              <div class="empty-tab">
                <mat-icon>folder_open</mat-icon>
                <p>No resources yet</p>
              </div>
            } @else {
              <div class="resource-grid">
                @for (r of resources(); track r.id) {
                  <mat-card class="resource-card">
                    <mat-icon class="resource-icon">
                      {{
                        r.type === 'PDF'
                          ? 'picture_as_pdf'
                          : r.type === 'VIDEO'
                            ? 'videocam'
                            : 'headphones'
                      }}
                    </mat-icon>
                    <div class="resource-info">
                      <span class="resource-title">{{ r.title }}</span>
                      <span class="resource-type">{{ r.type }}</span>
                    </div>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>

        <!-- Sessions Tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>event</mat-icon>&nbsp;Sessions ({{ seances().length }})
          </ng-template>
          <div class="tab-content">
            @if (seances().length === 0) {
              <div class="empty-tab">
                <mat-icon>event_busy</mat-icon>
                <p>No sessions scheduled</p>
              </div>
            } @else {
              <div class="seance-list">
                @for (s of seances(); track s.id) {
                  <mat-card class="seance-card">
                    <div class="seance-date">
                      <span class="day">{{ s.startDateTime | date: 'dd' }}</span>
                      <span class="month">{{ s.startDateTime | date: 'MMM' }}</span>
                    </div>
                    <div class="seance-info">
                      <span class="seance-title">{{ s.title }}</span>
                      <span class="seance-meta"
                        >{{ s.startDateTime | date: 'h:mm a' }} · {{ s.durationMinutes }} min</span
                      >
                      <span class="seance-desc">{{ s.description }}</span>
                    </div>
                    <span class="status-badge" [class]="'status-' + s.status.toLowerCase()">{{
                      s.status
                    }}</span>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: [
    `
      .header-row {
        margin-bottom: 8px;
      }

      .course-header {
        margin-bottom: 24px;
      }
      .course-title-section {
        h1 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 12px;
          color: #1a1a2e;
        }
      }
      .course-badges {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .level-badge,
      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
      }
      .level-a1 {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .level-a2 {
        background: #e3f2fd;
        color: #1565c0;
      }
      .level-b1 {
        background: #fff3e0;
        color: #e65100;
      }
      .level-b2 {
        background: #fce4ec;
        color: #c62828;
      }
      .level-c1 {
        background: #f3e5f5;
        color: #7b1fa2;
      }
      .level-c2 {
        background: #ede7f6;
        color: #4527a0;
      }
      .status-active {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .status-planned {
        background: #fff3e0;
        color: #e65100;
      }
      .status-finished {
        background: #f5f5f5;
        color: #616161;
      }
      .description {
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.6;
        margin: 0;
      }

      .tab-content {
        padding: 20px 0;
      }
      .empty-tab {
        text-align: center;
        padding: 40px;
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: rgba(0, 0, 0, 0.15);
        }
        p {
          color: rgba(0, 0, 0, 0.4);
        }
      }

      .chapter-order {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e3f2fd;
        color: #1565c0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .resource-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 12px;
      }
      .resource-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-radius: 12px !important;
      }
      .resource-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #1565c0;
      }
      .resource-info {
        display: flex;
        flex-direction: column;
      }
      .resource-title {
        font-weight: 500;
      }
      .resource-type {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        text-transform: uppercase;
      }

      .seance-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .seance-card {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 16px 20px;
        border-radius: 12px !important;
      }
      .seance-date {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 12px;
        border-radius: 10px;
        background: #e3f2fd;
        .day {
          font-size: 22px;
          font-weight: 700;
          color: #1565c0;
          line-height: 1;
        }
        .month {
          font-size: 12px;
          font-weight: 600;
          color: #1565c0;
          text-transform: uppercase;
        }
      }
      .seance-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .seance-title {
        font-weight: 500;
      }
      .seance-meta {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
      }
      .seance-desc {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class CourseDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly courseApi = inject(CourseApiService);
  private readonly snack = inject(MatSnackBar);

  course = signal<Course | null>(null);
  chapters = signal<Chapter[]>([]);
  resources = signal<Resource[]>([]);
  seances = signal<Seance[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.courseApi
      .getCourse(id)
      .subscribe({
        next: (c) => this.course.set(c),
        error: () => this.snack.open('Course not found', 'OK', { duration: 3000 }),
      });
    this.courseApi
      .listChapters(id)
      .subscribe({ next: (c) => this.chapters.set(c), error: () => {} });
    this.courseApi
      .listResources(id)
      .subscribe({ next: (r) => this.resources.set(r), error: () => {} });
    this.courseApi.listSeances(id).subscribe({ next: (s) => this.seances.set(s), error: () => {} });
  }
}
