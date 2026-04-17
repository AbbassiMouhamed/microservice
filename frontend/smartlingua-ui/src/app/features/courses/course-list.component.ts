import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { CourseApiService } from '../../services/course-api.service';
import { Course, CourseLevel } from '../../models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>Courses</h1>
          <p>Browse and manage language learning courses</p>
        </div>
        @if (auth.isTeacherOrAdmin) {
          <a mat-flat-button color="primary" routerLink="/courses/new">
            <mat-icon>add</mat-icon> New Course
          </a>
        }
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <mat-form-field appearance="outline" class="level-filter">
        <mat-label>Filter by Level</mat-label>
        <mat-select [(value)]="selectedLevel" (selectionChange)="loadCourses()">
          <mat-option>All Levels</mat-option>
          @for (level of levels; track level) {
            <mat-option [value]="level">{{ level }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    <!-- Course Grid -->
    <div class="course-grid">
      @for (course of courses(); track course.id) {
        <mat-card class="course-card" [routerLink]="['/courses', course.id]">
          <div class="course-level-badge" [class]="'level-' + course.level?.toLowerCase()">
            {{ course.level || '—' }}
          </div>
          <mat-card-header>
            <mat-card-title>{{ course.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="status-chip" [class]="'status-' + course.status?.toLowerCase()">
                {{ course.status }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="course-desc">{{ course.description || 'No description provided' }}</p>
            <div class="course-meta">
              @if (course.startDate) {
                <span class="meta-item">
                  <mat-icon>event</mat-icon>
                  {{ course.startDate | date: 'mediumDate' }}
                </span>
              }
              @if (course.price) {
                <span class="meta-item">
                  <mat-icon>payments</mat-icon>
                  {{ course.price | currency }}
                </span>
              }
            </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <a mat-button [routerLink]="['/courses', course.id]">
              View Details <mat-icon>arrow_forward</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>
      }
    </div>

    @if (courses().length === 0) {
      <div class="empty-state">
        <mat-icon>school</mat-icon>
        <h3>No courses found</h3>
        <p>
          There are no courses available{{ selectedLevel ? ' for level ' + selectedLevel : '' }}.
        </p>
        @if (auth.isTeacherOrAdmin) {
          <a mat-flat-button color="primary" routerLink="/courses/new">Create First Course</a>
        }
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
      .header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .filters {
        margin-bottom: 20px;
      }
      .level-filter {
        min-width: 180px;
      }

      .course-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      .course-card {
        flex: 1 1 340px;
        cursor: pointer;
        position: relative;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        border-radius: 16px !important;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
      }

      .course-level-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        &.level-a1 {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.level-a2 {
          background: #e3f2fd;
          color: #1565c0;
        }
        &.level-b1 {
          background: #fff3e0;
          color: #e65100;
        }
        &.level-b2 {
          background: #fce4ec;
          color: #c62828;
        }
        &.level-c1 {
          background: #f3e5f5;
          color: #7b1fa2;
        }
        &.level-c2 {
          background: #ede7f6;
          color: #4527a0;
        }
      }

      .status-chip {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 4px;
        &.status-active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.status-planned {
          background: #fff3e0;
          color: #e65100;
        }
        &.status-finished {
          background: #f5f5f5;
          color: #616161;
        }
      }

      .course-desc {
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .course-meta {
        display: flex;
        gap: 16px;
        margin-top: 12px;
      }
      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: rgba(0, 0, 0, 0.15);
        }
        h3 {
          margin: 16px 0 8px;
          color: #1a1a2e;
        }
        p {
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
        }
      }
    `,
  ],
})
export class CourseListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly courseApi = inject(CourseApiService);
  private readonly snack = inject(MatSnackBar);

  readonly levels: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  courses = signal<Course[]>([]);
  selectedLevel: CourseLevel | undefined;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseApi.listCourses(0, 50, this.selectedLevel).subscribe({
      next: (page) => this.courses.set(page.content ?? (page as any)),
      error: () => this.snack.open('Failed to load courses', 'OK', { duration: 3000 }),
    });
  }
}
