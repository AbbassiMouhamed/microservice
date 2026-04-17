import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { ForumApiService } from '../../services/forum-api.service';
import { ForumPost, ForumComment } from '../../models';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <a mat-button routerLink="/forum" class="back-btn">
      <mat-icon>arrow_back</mat-icon> Back to Forum
    </a>

    @if (post()) {
      <!-- Post card -->
      <mat-card class="post-card">
        <div class="post-header">
          <div class="author-avatar" [style.background]="getAvatarGradient(post()!.authorName)">
            {{ post()!.authorName?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="post-meta">
            <span class="author-name">{{ post()!.authorName }}</span>
            <span class="post-date">{{ post()!.createdAt | date: 'EEEE, MMM d, y · h:mm a' }}</span>
          </div>
          @if (post()!.category) {
            <span class="category-badge">{{ post()!.category }}</span>
          }
        </div>

        <h1 class="post-title">{{ post()!.title }}</h1>
        <div class="post-content">{{ post()!.content }}</div>

        <mat-divider></mat-divider>

        <div class="post-actions">
          <button
            mat-button
            class="action-btn"
            [class.liked]="post()!.userLiked"
            (click)="toggleLike()"
            matTooltip="{{ post()!.userLiked ? 'Unlike' : 'Like' }}"
          >
            <mat-icon>{{ post()!.userLiked ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
            <span class="action-count">{{ post()!.likesCount }}</span>
            <span class="action-label">{{ post()!.likesCount === 1 ? 'Like' : 'Likes' }}</span>
          </button>
          <button mat-button class="action-btn">
            <mat-icon>chat_bubble_outline</mat-icon>
            <span class="action-count">{{ post()!.commentsCount }}</span>
            <span class="action-label">{{
              post()!.commentsCount === 1 ? 'Comment' : 'Comments'
            }}</span>
          </button>
          <div class="action-spacer"></div>
          <button mat-button class="action-btn report-btn" (click)="showReport.set(!showReport())">
            <mat-icon>outlined_flag</mat-icon>
            <span class="action-label">Report</span>
          </button>
        </div>
      </mat-card>

      <!-- Report -->
      @if (showReport()) {
        <mat-card class="report-card" appearance="outlined">
          <div class="report-header">
            <mat-icon class="report-icon">flag</mat-icon>
            <h3>Report this post</h3>
          </div>
          <textarea
            class="report-input"
            [(ngModel)]="reportReason"
            rows="3"
            placeholder="Please describe the reason for reporting this post..."
          ></textarea>
          <div class="report-actions">
            <button mat-button (click)="showReport.set(false)">Cancel</button>
            <button mat-flat-button color="warn" [disabled]="!reportReason" (click)="reportPost()">
              <mat-icon>send</mat-icon> Submit Report
            </button>
          </div>
        </mat-card>
      }

      <!-- Comments Section -->
      <div class="comments-section">
        <div class="comments-header">
          <h2>Discussion</h2>
          <span class="comments-count">{{ comments().length }} comments</span>
        </div>

        <!-- New comment -->
        <mat-card class="new-comment-card" appearance="outlined">
          <div class="new-comment-header">
            <div class="comment-avatar mine">
              <mat-icon>person</mat-icon>
            </div>
            <span class="new-comment-label">Join the discussion</span>
          </div>
          <textarea
            class="comment-input"
            [(ngModel)]="newComment"
            rows="3"
            placeholder="Share your thoughts..."
          ></textarea>
          <div class="comment-submit">
            <button mat-flat-button color="primary" [disabled]="!newComment" (click)="addComment()">
              <mat-icon>send</mat-icon> Comment
            </button>
          </div>
        </mat-card>

        <!-- Comments list -->
        <div class="comments-list">
          @for (c of comments(); track c.id) {
            <div class="comment-item">
              <div class="comment-thread-line"></div>
              <div class="comment-content-wrapper">
                <div class="comment-header">
                  <div class="comment-avatar" [style.background]="getAvatarGradient(c.authorName)">
                    {{ c.authorName?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <div class="comment-meta">
                    <span class="comment-author">{{ c.authorName }}</span>
                    <span class="comment-date">{{ c.createdAt | date: 'MMM d · h:mm a' }}</span>
                  </div>
                </div>
                <div class="comment-body">{{ c.content }}</div>

                <div class="comment-actions">
                  <button
                    mat-button
                    class="reply-btn"
                    (click)="replyTo.set(replyTo() === c.id ? null : c.id)"
                  >
                    <mat-icon>reply</mat-icon> Reply
                  </button>
                </div>

                <!-- Reply form -->
                @if (replyTo() === c.id) {
                  <div class="reply-form">
                    <textarea
                      class="comment-input small"
                      [(ngModel)]="replyContent"
                      rows="2"
                      placeholder="Write a reply to {{ c.authorName }}..."
                    ></textarea>
                    <div class="reply-actions">
                      <button mat-button (click)="replyTo.set(null)">Cancel</button>
                      <button
                        mat-flat-button
                        color="primary"
                        [disabled]="!replyContent"
                        (click)="addReply(c.id)"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                }

                <!-- Nested replies -->
                @if (c.replies && c.replies.length > 0) {
                  <div class="replies">
                    @for (r of c.replies; track r.id) {
                      <div class="comment-item reply">
                        <div class="comment-header">
                          <div
                            class="comment-avatar small"
                            [style.background]="getAvatarGradient(r.authorName)"
                          >
                            {{ r.authorName?.charAt(0)?.toUpperCase() || '?' }}
                          </div>
                          <div class="comment-meta">
                            <span class="comment-author">{{ r.authorName }}</span>
                            <span class="comment-date">{{
                              r.createdAt | date: 'MMM d · h:mm a'
                            }}</span>
                          </div>
                        </div>
                        <div class="comment-body">{{ r.content }}</div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>

        @if (comments().length === 0) {
          <div class="empty-comments">
            <mat-icon>chat_bubble_outline</mat-icon>
            <p>No comments yet. Be the first to respond!</p>
          </div>
        }
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

      /* Post */
      .post-card {
        border-radius: 16px !important;
        margin-top: 8px;
        padding: 28px 32px !important;
      }
      .post-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 20px;
      }
      .author-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        flex-shrink: 0;
      }
      .post-meta {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .author-name {
        font-weight: 600;
        font-size: 15px;
        color: #1a1a2e;
      }
      .post-date {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        margin-top: 2px;
      }
      .category-badge {
        padding: 4px 14px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        background: #e3f2fd;
        color: #1565c0;
        flex-shrink: 0;
      }
      .post-title {
        font-size: 26px;
        font-weight: 700;
        margin: 0 0 16px;
        color: #1a1a2e;
        line-height: 1.3;
        letter-spacing: -0.3px;
      }
      .post-content {
        font-size: 15px;
        line-height: 1.8;
        color: rgba(0, 0, 0, 0.7);
        white-space: pre-wrap;
        margin-bottom: 20px;
      }

      /* Actions */
      .post-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        padding-top: 16px;
      }
      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 10px !important;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.55);
        &.liked {
          color: #1565c0;
          background: rgba(21, 101, 192, 0.06);
        }
      }
      .action-count {
        font-weight: 600;
      }
      .action-label {
        font-weight: 400;
      }
      .action-spacer {
        flex: 1;
      }
      .report-btn {
        color: rgba(0, 0, 0, 0.35);
        &:hover {
          color: #d32f2f;
        }
      }

      /* Report */
      .report-card {
        border-radius: 14px !important;
        margin-top: 16px;
        padding: 20px 24px !important;
        border-color: #ffcdd2 !important;
        background: #fff5f5 !important;
      }
      .report-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }
      .report-icon {
        color: #d32f2f;
      }
      .report-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #c62828;
      }
      .report-input {
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        padding: 12px;
        font-size: 14px;
        resize: vertical;
        outline: none;
        &:focus {
          border-color: #d32f2f;
        }
      }
      .report-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }

      /* Comments */
      .comments-section {
        margin-top: 28px;
      }
      .comments-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        h2 {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          color: #1a1a2e;
        }
      }
      .comments-count {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.45);
        background: rgba(0, 0, 0, 0.04);
        padding: 4px 12px;
        border-radius: 20px;
      }

      /* New comment */
      .new-comment-card {
        border-radius: 14px !important;
        padding: 20px 24px !important;
        margin-bottom: 24px;
        border-color: #e3f2fd !important;
      }
      .new-comment-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .new-comment-label {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.5);
      }
      .comment-avatar.mine {
        background: #e3f2fd;
        color: #1565c0;
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
      .comment-input {
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        padding: 14px;
        font-size: 14px;
        resize: vertical;
        outline: none;
        line-height: 1.5;
        background: #fafbff;
        transition: border-color 0.2s;
        &:focus {
          border-color: #1565c0;
        }
        &.small {
          padding: 10px 12px;
        }
      }
      .comment-submit {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
      }

      /* Comment items */
      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .comment-item {
        position: relative;
        padding: 18px 20px;
        border-radius: 14px;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.04);
        transition: background 0.15s;
        &:hover {
          background: #fafbff;
        }
      }
      .comment-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .comment-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 13px;
        flex-shrink: 0;
        &.small {
          width: 28px;
          height: 28px;
          font-size: 11px;
        }
      }
      .comment-meta {
        display: flex;
        flex-direction: column;
      }
      .comment-author {
        font-weight: 600;
        font-size: 13px;
        color: #1a1a2e;
      }
      .comment-date {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.35);
      }
      .comment-body {
        font-size: 14px;
        line-height: 1.6;
        color: rgba(0, 0, 0, 0.65);
        margin-left: 44px;
      }
      .comment-actions {
        margin-left: 44px;
        margin-top: 6px;
      }
      .reply-btn {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
        border-radius: 8px !important;
        &:hover {
          color: #1565c0;
        }
      }
      .replies {
        margin-top: 10px;
        margin-left: 44px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .reply {
        background: rgba(21, 101, 192, 0.02);
        border: 1px solid rgba(21, 101, 192, 0.06);
      }
      .reply-form {
        margin-top: 10px;
        margin-left: 44px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .empty-comments {
        text-align: center;
        padding: 40px 20px;
        color: rgba(0, 0, 0, 0.35);
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          margin-bottom: 8px;
        }
        p {
          margin: 0;
          font-size: 14px;
        }
      }
    `,
  ],
})
export class ForumDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly forumApi = inject(ForumApiService);
  private readonly snack = inject(MatSnackBar);

  post = signal<ForumPost | null>(null);
  comments = signal<ForumComment[]>([]);
  showReport = signal(false);
  replyTo = signal<number | null>(null);
  newComment = '';
  replyContent = '';
  reportReason = '';

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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.forumApi.getPost(id).subscribe({ next: (p) => this.post.set(p), error: () => {} });
    this.forumApi
      .listComments(id)
      .subscribe({ next: (c) => this.comments.set(c), error: () => {} });
  }

  toggleLike(): void {
    const p = this.post();
    if (!p) return;
    const op$ = p.userLiked ? this.forumApi.unlikePost(p.id) : this.forumApi.likePost(p.id);
    op$.subscribe({
      next: () => {
        this.post.set({
          ...p,
          userLiked: !p.userLiked,
          likesCount: p.likesCount + (p.userLiked ? -1 : 1),
        });
      },
    });
  }

  addComment(): void {
    const p = this.post();
    if (!p || !this.newComment) return;
    this.forumApi.createComment(p.id, { content: this.newComment }).subscribe({
      next: () => {
        this.newComment = '';
        this.forumApi.listComments(p.id).subscribe((c) => this.comments.set(c));
      },
      error: () => this.snack.open('Failed to add comment', 'OK', { duration: 3000 }),
    });
  }

  addReply(parentId: number): void {
    const p = this.post();
    if (!p || !this.replyContent) return;
    this.forumApi
      .createComment(p.id, { content: this.replyContent, parentCommentId: parentId })
      .subscribe({
        next: () => {
          this.replyContent = '';
          this.replyTo.set(null);
          this.forumApi.listComments(p.id).subscribe((c) => this.comments.set(c));
        },
        error: () => this.snack.open('Failed to reply', 'OK', { duration: 3000 }),
      });
  }

  reportPost(): void {
    const p = this.post();
    if (!p || !this.reportReason) return;
    this.forumApi.reportPost(p.id, this.reportReason).subscribe({
      next: () => {
        this.snack.open('Report submitted', 'OK', { duration: 3000 });
        this.showReport.set(false);
        this.reportReason = '';
      },
    });
  }
}
