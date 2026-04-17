import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

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
  ],
  template: `
    <div class="page-header">
      <div class="header-row">
        <h1>Notifications</h1>
        @if (notifications().length > 0) {
          <button mat-button (click)="markAllRead()">
            <mat-icon>done_all</mat-icon> Mark all read
          </button>
        }
      </div>
    </div>

    <div class="notif-list">
      @for (n of notifications(); track n.id) {
        <div class="notif-item" [class.unread]="!n.read" (click)="markRead(n)">
          <mat-icon class="notif-icon" [class.unread]="!n.read">{{
            n.read ? 'notifications' : 'notifications_active'
          }}</mat-icon>
          <div class="notif-info">
            <span class="notif-message">{{ n.message }}</span>
            <span class="notif-time">{{ n.createdAt | date: 'MMM d · h:mm a' }}</span>
          </div>
        </div>
      }
    </div>

    @if (notifications().length === 0) {
      <div class="empty-state">
        <mat-icon>notifications_off</mat-icon>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
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
          margin: 0;
          color: #1a1a2e;
        }
      }
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .notif-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .notif-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.15s;
        &:hover {
          background: rgba(0, 0, 0, 0.03);
        }
        &.unread {
          background: rgba(21, 101, 192, 0.04);
        }
      }
      .notif-icon {
        color: rgba(0, 0, 0, 0.3);
        &.unread {
          color: #1565c0;
        }
      }
      .notif-info {
        display: flex;
        flex-direction: column;
      }
      .notif-message {
        font-size: 14px;
        font-weight: 500;
      }
      .notif-time {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: rgba(0, 0, 0, 0.15);
        }
        h3 {
          margin: 16px 0 8px;
        }
        p {
          color: rgba(0, 0, 0, 0.5);
        }
      }
    `,
  ],
})
export class NotificationsComponent implements OnInit {
  private readonly forumApi = inject(ForumApiService);

  notifications = signal<ForumNotification[]>([]);

  ngOnInit(): void {
    this.forumApi.listNotifications().subscribe({
      next: (n) => this.notifications.set(n),
      error: () => {},
    });
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
