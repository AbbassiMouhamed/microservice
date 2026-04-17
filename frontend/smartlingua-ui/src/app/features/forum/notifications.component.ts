import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ForumApiService } from '../../services/forum-api.service';
import { ForumNotification } from '../../models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  template: `
    <a mat-button routerLink="/forum" class="back-btn">
      <mat-icon>arrow_back</mat-icon> Back to Forum
    </a>

    <div class="page-header">
      <div class="header-left">
        <h1>Notifications</h1>
        @if (unreadCount() > 0) {
          <span class="unread-badge">{{ unreadCount() }} new</span>
        }
      </div>
      @if (notifications().length > 0) {
        <button mat-stroked-button class="mark-all-btn" (click)="markAllRead()">
          <mat-icon>done_all</mat-icon> Mark all read
        </button>
      }
    </div>

    @if (todayNotifs().length > 0) {
      <div class="time-group">
        <span class="time-label">Today</span>
      </div>
      @for (n of todayNotifs(); track n.id) {
        <div
          class="notif-item"
          [class.unread]="!n.read"
          [class.high-priority]="n.priority === 'HIGH'"
          (click)="handleClick(n)"
        >
          <div class="notif-icon-wrapper" [ngClass]="getIconClass(n)">
            <mat-icon>{{ getIcon(n) }}</mat-icon>
          </div>
          <div class="notif-content">
            @if (n.title) {
              <span class="notif-title">{{ n.title }}</span>
            }
            <span class="notif-message">{{ n.message }}</span>
            <span class="notif-time">{{ n.createdAt | date: 'h:mm a' }}</span>
          </div>
          @if (!n.read) {
            <div class="unread-dot"></div>
          }
        </div>
      }
    }

    @if (earlierNotifs().length > 0) {
      <div class="time-group">
        <span class="time-label">Earlier</span>
      </div>
      @for (n of earlierNotifs(); track n.id) {
        <div
          class="notif-item"
          [class.unread]="!n.read"
          [class.high-priority]="n.priority === 'HIGH'"
          (click)="handleClick(n)"
        >
          <div class="notif-icon-wrapper" [ngClass]="getIconClass(n)">
            <mat-icon>{{ getIcon(n) }}</mat-icon>
          </div>
          <div class="notif-content">
            @if (n.title) {
              <span class="notif-title">{{ n.title }}</span>
            }
            <span class="notif-message">{{ n.message }}</span>
            <span class="notif-time">{{ n.createdAt | date: 'MMM d · h:mm a' }}</span>
          </div>
          @if (!n.read) {
            <div class="unread-dot"></div>
          }
        </div>
      }
    }

    @if (notifications().length === 0) {
      <div class="empty-state">
        <div class="empty-icon-wrapper">
          <mat-icon>notifications_off</mat-icon>
        </div>
        <h3>All caught up!</h3>
        <p>No new notifications. Check back later.</p>
        <a mat-flat-button color="primary" routerLink="/forum">
          <mat-icon>forum</mat-icon> Browse Forum
        </a>
      </div>
    }
  `,
  styles: [
    `
      .back-btn {
        margin-bottom: 8px;
        color: rgba(0, 0, 0, 0.6);
        &:hover {
          color: #1565c0;
        }
      }

      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #1a1a2e;
        }
      }
      .unread-badge {
        background: #1565c0;
        color: white;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 20px;
      }
      .mark-all-btn {
        border-radius: 12px !important;
        font-size: 13px !important;
      }

      .time-group {
        margin: 20px 0 10px;
      }
      .time-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba(0, 0, 0, 0.35);
      }

      .notif-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.15s;
        margin-bottom: 4px;
        background: white;
        border: 1px solid transparent;
        &:hover {
          background: #fafbff;
          border-color: rgba(0, 0, 0, 0.04);
        }
        &.unread {
          background: rgba(21, 101, 192, 0.04);
          border-color: rgba(21, 101, 192, 0.08);
        }
        &.high-priority.unread {
          border-left: 3px solid #ff6d00;
        }
      }

      .notif-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
      .icon-like {
        background: #e3f2fd;
        color: #1565c0;
      }
      .icon-comment {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .icon-report {
        background: #fce4ec;
        color: #c62828;
      }
      .icon-moderation {
        background: #fff3e0;
        color: #e65100;
      }
      .icon-default {
        background: #f5f5f5;
        color: rgba(0, 0, 0, 0.4);
      }

      .notif-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .notif-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
        margin-bottom: 2px;
      }
      .notif-message {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .notif-time {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.35);
        margin-top: 3px;
      }

      .unread-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1565c0;
        flex-shrink: 0;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
      }
      .empty-icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #f5f5f5;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: rgba(0, 0, 0, 0.2);
        }
      }
      .empty-state h3 {
        margin: 0 0 8px;
        font-size: 20px;
        color: #1a1a2e;
      }
      .empty-state p {
        color: rgba(0, 0, 0, 0.5);
        margin: 0 0 20px;
      }
    `,
  ],
})
export class NotificationsComponent implements OnInit {
  private readonly forumApi = inject(ForumApiService);
  private readonly router = inject(Router);

  notifications = signal<ForumNotification[]>([]);

  unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  todayNotifs = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.notifications().filter((n) => new Date(n.createdAt) >= today);
  });

  earlierNotifs = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.notifications().filter((n) => new Date(n.createdAt) < today);
  });

  getIcon(n: ForumNotification): string {
    const type = (n.type || n.sourceType || '').toLowerCase();
    if (type.includes('like')) return 'thumb_up';
    if (type.includes('comment') || type.includes('reply')) return 'chat_bubble';
    if (type.includes('report') || type.includes('flag')) return 'flag';
    if (type.includes('moder')) return 'shield';
    return 'notifications';
  }

  getIconClass(n: ForumNotification): string {
    const type = (n.type || n.sourceType || '').toLowerCase();
    if (type.includes('like')) return 'icon-like';
    if (type.includes('comment') || type.includes('reply')) return 'icon-comment';
    if (type.includes('report') || type.includes('flag')) return 'icon-report';
    if (type.includes('moder')) return 'icon-moderation';
    return 'icon-default';
  }

  ngOnInit(): void {
    this.forumApi.listNotifications().subscribe({
      next: (n) => this.notifications.set(n),
      error: () => {},
    });
  }

  handleClick(n: ForumNotification): void {
    if (!n.read) {
      this.markRead(n);
    }
    if (n.actionUrl) {
      this.router.navigateByUrl(n.actionUrl);
    } else if (n.sourceId) {
      this.router.navigate(['/forum', n.sourceId]);
    }
  }

  markRead(n: ForumNotification): void {
    if (n.read) return;
    this.forumApi.markNotificationRead(n.id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
        );
      },
    });
  }

  markAllRead(): void {
    this.forumApi.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((x) => ({ ...x, read: true })));
      },
    });
  }
}
