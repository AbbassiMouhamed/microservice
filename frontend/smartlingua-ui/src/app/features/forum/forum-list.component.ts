import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { ForumApiService } from '../../services/forum-api.service';
import { ForumPost } from '../../models';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FormsModule,
  ],
  template: `
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>Forum</h1>
          <p>Community discussions and knowledge sharing</p>
        </div>
        <button mat-flat-button color="primary" (click)="showCreate.set(true)">
          <mat-icon>add</mat-icon> New Post
        </button>
      </div>
    </div>

    <!-- Create Post Inline -->
    @if (showCreate()) {
      <mat-card class="create-card">
        <mat-card-content>
          <input class="create-title" [(ngModel)]="newTitle" placeholder="Post title..." />
          <textarea
            class="create-content"
            [(ngModel)]="newContent"
            rows="4"
            placeholder="Write your post..."
          ></textarea>
          <div class="create-actions">
            <button mat-button (click)="showCreate.set(false)">Cancel</button>
            <button
              mat-flat-button
              color="primary"
              [disabled]="!newTitle || !newContent"
              (click)="createPost()"
            >
              Publish
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    }

    <!-- Posts -->
    <div class="posts-list">
      @for (post of posts(); track post.id) {
        <mat-card class="post-card" [routerLink]="['/forum', post.id]">
          <div class="post-body">
            <div class="post-main">
              <div class="post-header">
                <div class="author-avatar">
                  {{ post.authorName?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="post-meta">
                  <span class="author-name">{{ post.authorName }}</span>
                  <span class="post-date">{{ post.createdAt | date: 'MMM d, y · h:mm a' }}</span>
                </div>
                @if (post.trending) {
                  <mat-icon class="trending">local_fire_department</mat-icon>
                }
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">
                {{ post.content | slice: 0 : 200 }}{{ post.content.length > 200 ? '...' : '' }}
              </p>
            </div>
            <div class="post-stats">
              <span class="stat"><mat-icon>thumb_up</mat-icon> {{ post.likesCount }}</span>
              <span class="stat"><mat-icon>comment</mat-icon> {{ post.commentsCount }}</span>
              @if (post.category) {
                <span class="category-chip">{{ post.category }}</span>
              }
            </div>
          </div>
        </mat-card>
      }
    </div>

    @if (posts().length === 0) {
      <div class="empty-state">
        <mat-icon>forum</mat-icon>
        <h3>No posts yet</h3>
        <p>Be the first to start a discussion!</p>
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
        flex-wrap: wrap;
      }

      .create-card {
        margin-bottom: 20px;
        border-radius: 16px !important;
      }
      .create-title {
        width: 100%;
        border: none;
        font-size: 18px;
        font-weight: 500;
        padding: 8px 0;
        outline: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        margin-bottom: 12px;
      }
      .create-content {
        width: 100%;
        border: none;
        font-size: 15px;
        resize: vertical;
        padding: 8px 0;
        outline: none;
        line-height: 1.5;
      }
      .create-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }

      .posts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .post-card {
        cursor: pointer;
        border-radius: 16px !important;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }
      }
      .post-body {
        padding: 4px 0;
      }
      .post-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .author-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1565c0, #7c4dff);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
      }
      .post-meta {
        display: flex;
        flex-direction: column;
      }
      .author-name {
        font-weight: 500;
        font-size: 14px;
      }
      .post-date {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
      .trending {
        color: #ff6d00;
        margin-left: auto;
      }
      .post-title {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .post-excerpt {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        line-height: 1.5;
      }
      .post-stats {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        align-items: center;
      }
      .stat {
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
      .category-chip {
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 500;
        background: #e3f2fd;
        color: #1565c0;
        margin-left: auto;
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
export class ForumListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly forumApi = inject(ForumApiService);
  private readonly snack = inject(MatSnackBar);

  posts = signal<ForumPost[]>([]);
  showCreate = signal(false);
  newTitle = '';
  newContent = '';

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.forumApi.listPosts().subscribe({
      next: (p) => this.posts.set(p),
      error: () => this.snack.open('Failed to load posts', 'OK', { duration: 3000 }),
    });
  }

  createPost(): void {
    this.forumApi.createPost({ title: this.newTitle, content: this.newContent }).subscribe({
      next: () => {
        this.snack.open('Post published', 'OK', { duration: 3000 });
        this.showCreate.set(false);
        this.newTitle = '';
        this.newContent = '';
        this.loadPosts();
      },
      error: () => this.snack.open('Failed to create post', 'OK', { duration: 3000 }),
    });
  }
}
