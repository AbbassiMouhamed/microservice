import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { ForumApiService } from '../../services/forum-api.service';
import { ForumPost, Announcement } from '../../models';

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
    MatTabsModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
  ],
  template: `
    <!-- Hero banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Community Forum</h1>
          <p>Ask questions, share knowledge, and connect with fellow learners</p>
        </div>
        <div class="hero-actions">
          <button mat-flat-button class="new-post-btn" (click)="showCreate.set(!showCreate())">
            <mat-icon>{{ showCreate() ? 'close' : 'edit_note' }}</mat-icon>
            {{ showCreate() ? 'Cancel' : 'New Post' }}
          </button>
          <a mat-stroked-button class="notif-btn" routerLink="/forum/notifications">
            <mat-icon>notifications</mat-icon> Notifications
          </a>
        </div>
      </div>
    </div>

    <!-- Announcements marquee -->
    @if (announcements().length > 0) {
      <div class="announcements-strip">
        <mat-icon class="announce-icon">campaign</mat-icon>
        <div class="announce-scroll">
          @for (a of announcements(); track a.id) {
            <span class="announce-item">
              <strong>{{ a.title }}</strong> — {{ a.content | slice: 0 : 80
              }}{{ a.content.length > 80 ? '...' : '' }}
            </span>
          }
        </div>
      </div>
    }

    <!-- Create Post -->
    @if (showCreate()) {
      <mat-card class="create-card" appearance="outlined">
        <div class="create-header">
          <mat-icon class="create-icon">lightbulb</mat-icon>
          <h3>Start a Discussion</h3>
        </div>
        <input
          class="create-title"
          [(ngModel)]="newTitle"
          placeholder="Give your post a clear title..."
        />
        <textarea
          class="create-content"
          [(ngModel)]="newContent"
          rows="5"
          placeholder="Share your thoughts, questions, or insights..."
        ></textarea>
        <div class="create-footer">
          <div class="create-category">
            <button mat-stroked-button [matMenuTriggerFor]="categoryMenu" class="cat-select-btn">
              <mat-icon>label</mat-icon>
              {{ newCategory || 'Select category' }}
            </button>
            <mat-menu #categoryMenu="matMenu">
              @for (cat of categories; track cat) {
                <button mat-menu-item (click)="newCategory = cat">{{ cat }}</button>
              }
            </mat-menu>
          </div>
          <div class="create-actions">
            <button
              mat-button
              (click)="showCreate.set(false); newTitle = ''; newContent = ''; newCategory = ''"
            >
              Discard
            </button>
            <button
              mat-flat-button
              color="primary"
              [disabled]="!newTitle || !newContent"
              (click)="createPost()"
            >
              <mat-icon>send</mat-icon> Publish
            </button>
          </div>
        </div>
      </mat-card>
    }

    <!-- Search & Filter bar -->
    <div class="toolbar">
      <div class="search-box">
        <mat-icon class="search-icon">search</mat-icon>
        <input class="search-input" [(ngModel)]="searchQuery" placeholder="Search discussions..." />
        @if (searchQuery) {
          <button
            mat-icon-button
            class="search-clear"
            (click)="searchQuery = ''"
            matTooltip="Clear search"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>
      <div class="filter-chips">
        @for (cat of ['All', ...categories]; track cat) {
          <button
            mat-stroked-button
            class="filter-chip"
            [class.active]="selectedCategory === cat || (cat === 'All' && !selectedCategory)"
            (click)="selectedCategory = cat === 'All' ? '' : cat"
          >
            {{ cat }}
          </button>
        }
      </div>
    </div>

    <!-- Trending section -->
    @if (trendingPosts().length > 0 && !searchQuery && !selectedCategory) {
      <div class="trending-section">
        <div class="section-header">
          <mat-icon class="fire-icon">local_fire_department</mat-icon>
          <h2>Trending Now</h2>
        </div>
        <div class="trending-grid">
          @for (post of trendingPosts(); track post.id) {
            <mat-card class="trending-card" [routerLink]="['/forum', post.id]">
              <div class="trending-rank">#{{ $index + 1 }}</div>
              <h4 class="trending-title">{{ post.title }}</h4>
              <div class="trending-stats">
                <span><mat-icon>thumb_up</mat-icon> {{ post.likesCount }}</span>
                <span><mat-icon>comment</mat-icon> {{ post.commentsCount }}</span>
              </div>
              <span class="trending-author">by {{ post.authorName }}</span>
            </mat-card>
          }
        </div>
      </div>
    }

    <!-- Posts list -->
    <div class="section-header posts-header">
      <h2>{{ selectedCategory || 'All' }} Discussions</h2>
      <span class="post-count">{{ filteredPosts().length }} posts</span>
    </div>

    <div class="posts-list">
      @for (post of filteredPosts(); track post.id) {
        <mat-card class="post-card" [routerLink]="['/forum', post.id]">
          <div class="post-body">
            <div class="post-left">
              <div class="author-avatar" [style.background]="getAvatarGradient(post.authorName)">
                {{ post.authorName?.charAt(0)?.toUpperCase() || '?' }}
              </div>
            </div>
            <div class="post-main">
              <div class="post-top-row">
                <div class="post-meta">
                  <span class="author-name">{{ post.authorName }}</span>
                  <span class="post-date">{{ post.createdAt | date: 'MMM d, y · h:mm a' }}</span>
                </div>
                <div class="post-badges">
                  @if (post.trending) {
                    <span class="badge trending-badge" matTooltip="Trending">
                      <mat-icon>local_fire_department</mat-icon> Trending
                    </span>
                  }
                  @if (post.category) {
                    <span class="badge category-badge">{{ post.category }}</span>
                  }
                </div>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">
                {{ post.content | slice: 0 : 200 }}{{ post.content.length > 200 ? '...' : '' }}
              </p>
              <div class="post-footer">
                <div class="post-stats">
                  <span class="stat" [class.liked]="post.userLiked">
                    <mat-icon>{{ post.userLiked ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
                    {{ post.likesCount }}
                  </span>
                  <span class="stat">
                    <mat-icon>chat_bubble_outline</mat-icon> {{ post.commentsCount }}
                    {{ post.commentsCount === 1 ? 'reply' : 'replies' }}
                  </span>
                </div>
                <span class="read-more">Read more <mat-icon>arrow_forward</mat-icon></span>
              </div>
            </div>
          </div>
        </mat-card>
      }
    </div>

    @if (filteredPosts().length === 0) {
      <div class="empty-state">
        <div class="empty-icon-wrapper">
          <mat-icon>forum</mat-icon>
        </div>
        <h3>{{ searchQuery || selectedCategory ? 'No matching discussions' : 'No posts yet' }}</h3>
        <p>
          {{
            searchQuery || selectedCategory
              ? 'Try different search terms or filters'
              : 'Be the first to start a discussion!'
          }}
        </p>
        @if (!searchQuery && !selectedCategory) {
          <button mat-flat-button color="primary" (click)="showCreate.set(true)">
            <mat-icon>edit_note</mat-icon> Create First Post
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      /* Hero */
      .hero-banner {
        background: linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1a237e 100%);
        border-radius: 20px;
        padding: 36px 40px;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
      }
      .hero-banner::before {
        content: '';
        position: absolute;
        top: -40px;
        right: -40px;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 50%;
      }
      .hero-banner::after {
        content: '';
        position: absolute;
        bottom: -60px;
        left: 30%;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 50%;
      }
      .hero-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        position: relative;
        z-index: 1;
      }
      .hero-text h1 {
        font-size: 32px;
        font-weight: 700;
        margin: 0 0 6px;
        color: white;
        letter-spacing: -0.5px;
      }
      .hero-text p {
        margin: 0;
        color: rgba(255, 255, 255, 0.75);
        font-size: 15px;
      }
      .hero-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .new-post-btn {
        background: white !important;
        color: #1565c0 !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        padding: 0 24px !important;
        height: 44px !important;
      }
      .notif-btn {
        border-color: rgba(255, 255, 255, 0.4) !important;
        color: white !important;
        border-radius: 12px !important;
        padding: 0 20px !important;
        height: 44px !important;
      }

      /* Announcements */
      .announcements-strip {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: #fff8e1;
        border: 1px solid #ffe082;
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
      }
      .announce-icon {
        color: #f57f17;
        flex-shrink: 0;
      }
      .announce-scroll {
        display: flex;
        gap: 32px;
        font-size: 13px;
        color: #5d4037;
        overflow-x: auto;
        white-space: nowrap;
      }
      .announce-item strong {
        color: #e65100;
      }

      /* Create Post */
      .create-card {
        margin-bottom: 24px;
        border-radius: 16px !important;
        padding: 24px !important;
        border: 2px solid #e3f2fd !important;
      }
      .create-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      }
      .create-icon {
        color: #ffc107;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      .create-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1a1a2e;
      }
      .create-title {
        width: 100%;
        border: none;
        font-size: 18px;
        font-weight: 500;
        padding: 12px 0;
        outline: none;
        border-bottom: 2px solid rgba(0, 0, 0, 0.06);
        margin-bottom: 12px;
        background: transparent;
        transition: border-color 0.2s;
        &:focus {
          border-color: #1565c0;
        }
      }
      .create-content {
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 12px;
        font-size: 15px;
        resize: vertical;
        padding: 14px;
        outline: none;
        line-height: 1.6;
        background: #fafbff;
        transition: border-color 0.2s;
        &:focus {
          border-color: #1565c0;
        }
      }
      .create-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .cat-select-btn {
        border-radius: 10px !important;
        font-size: 13px !important;
      }
      .create-actions {
        display: flex;
        gap: 8px;
      }

      /* Toolbar */
      .toolbar {
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .search-box {
        display: flex;
        align-items: center;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 14px;
        padding: 0 16px;
        height: 48px;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
        &:focus-within {
          border-color: #1565c0;
          box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.08);
        }
      }
      .search-icon {
        color: rgba(0, 0, 0, 0.35);
        margin-right: 10px;
      }
      .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 15px;
        background: transparent;
      }
      .search-clear {
        margin-left: 4px;
      }
      .filter-chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .filter-chip {
        border-radius: 20px !important;
        font-size: 13px !important;
        height: 34px !important;
        padding: 0 16px !important;
        border-color: rgba(0, 0, 0, 0.12) !important;
        transition: all 0.15s;
        &.active {
          background: #1565c0 !important;
          color: white !important;
          border-color: #1565c0 !important;
        }
      }

      /* Trending */
      .trending-section {
        margin-bottom: 32px;
      }
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #1a1a2e;
        }
      }
      .fire-icon {
        color: #ff6d00;
      }
      .trending-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
      }
      .trending-card {
        cursor: pointer;
        border-radius: 14px !important;
        padding: 20px !important;
        border-left: 4px solid #ff6d00 !important;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        }
      }
      .trending-rank {
        font-size: 13px;
        font-weight: 700;
        color: #ff6d00;
        margin-bottom: 8px;
      }
      .trending-title {
        margin: 0 0 10px;
        font-size: 15px;
        font-weight: 600;
        color: #1a1a2e;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .trending-stats {
        display: flex;
        gap: 14px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        margin-bottom: 6px;
        span {
          display: flex;
          align-items: center;
          gap: 3px;
          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }
      }
      .trending-author {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
      }

      /* Posts */
      .posts-header {
        justify-content: space-between;
      }
      .post-count {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);
        font-weight: 400;
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
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
        }
      }
      .post-body {
        display: flex;
        gap: 16px;
        padding: 4px 0;
      }
      .post-left {
        flex-shrink: 0;
        padding-top: 2px;
      }
      .author-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        flex-shrink: 0;
      }
      .post-main {
        flex: 1;
        min-width: 0;
      }
      .post-top-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      }
      .post-meta {
        display: flex;
        flex-direction: column;
      }
      .author-name {
        font-weight: 500;
        font-size: 14px;
        color: #1a1a2e;
      }
      .post-date {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
      }
      .post-badges {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
      }
      .trending-badge {
        background: #fff3e0;
        color: #e65100;
        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
      .category-badge {
        background: #e3f2fd;
        color: #1565c0;
      }
      .post-title {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a2e;
        line-height: 1.3;
      }
      .post-excerpt {
        margin: 0 0 12px;
        color: rgba(0, 0, 0, 0.55);
        font-size: 14px;
        line-height: 1.6;
      }
      .post-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .post-stats {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .stat {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
        &.liked {
          color: #1565c0;
        }
      }
      .read-more {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 13px;
        font-weight: 500;
        color: #1565c0;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      /* Empty state */
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
export class ForumListComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly forumApi = inject(ForumApiService);
  private readonly snack = inject(MatSnackBar);

  posts = signal<ForumPost[]>([]);
  trendingPosts = signal<ForumPost[]>([]);
  announcements = signal<Announcement[]>([]);
  showCreate = signal(false);
  newTitle = '';
  newContent = '';
  newCategory = '';
  searchQuery = '';
  selectedCategory = '';
  categories = ['General', 'Grammar', 'Vocabulary', 'Pronunciation', 'Culture', 'Tips'];

  filteredPosts = computed(() => {
    let list = this.posts();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q),
      );
    }
    if (this.selectedCategory) {
      list = list.filter((p) => p.category === this.selectedCategory);
    }
    return list;
  });

  getAvatarGradient(name?: string): string {
    const gradients = [
      'linear-gradient(135deg, #1565c0, #7c4dff)',
      'linear-gradient(135deg, #00897b, #26a69a)',
      'linear-gradient(135deg, #e65100, #ff8f00)',
      'linear-gradient(135deg, #6a1b9a, #ab47bc)',
      'linear-gradient(135deg, #c62828, #ef5350)',
      'linear-gradient(135deg, #2e7d32, #66bb6a)',
    ];
    const hash = (name || '?').charCodeAt(0) % gradients.length;
    return gradients[hash];
  }

  ngOnInit(): void {
    this.loadPosts();
    this.forumApi.getTrendingPosts().subscribe({
      next: (p) => this.trendingPosts.set(p.slice(0, 4)),
      error: () => {},
    });
    this.forumApi.listAnnouncements().subscribe({
      next: (a) => this.announcements.set(a.filter((x) => x.active)),
      error: () => {},
    });
  }

  loadPosts(): void {
    this.forumApi.listPosts().subscribe({
      next: (p) => this.posts.set(p),
      error: () => this.snack.open('Failed to load posts', 'OK', { duration: 3000 }),
    });
  }

  createPost(): void {
    this.forumApi
      .createPost({
        title: this.newTitle,
        content: this.newContent,
        ...(this.newCategory ? { category: this.newCategory } : {}),
      } as any)
      .subscribe({
        next: () => {
          this.showCreate.set(false);
          this.newTitle = '';
          this.newContent = '';
          this.newCategory = '';
          this.loadPosts();
        },
        error: () => this.snack.open('Failed to create post', 'OK', { duration: 3000 }),
      });
  }

  toggleCategory(cat: string): void {
    this.selectedCategory = this.selectedCategory === cat ? '' : cat;
  }
}
