import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
  ],
  template: `
    <a mat-button routerLink="/forum"><mat-icon>arrow_back</mat-icon> Back to Forum</a>

    @if (post()) {
      <mat-card class="post-card">
        <div class="post-header">
          <div class="author-avatar">{{ post()!.authorName?.charAt(0)?.toUpperCase() || '?' }}</div>
          <div class="post-meta">
            <span class="author-name">{{ post()!.authorName }}</span>
            <span class="post-date">{{ post()!.createdAt | date: 'MMM d, y · h:mm a' }}</span>
          </div>
        </div>

        <h1 class="post-title">{{ post()!.title }}</h1>
        <div class="post-content">{{ post()!.content }}</div>

        <div class="post-actions">
          <button mat-button (click)="toggleLike()">
            <mat-icon>{{ post()!.userLiked ? 'thumb_up' : 'thumb_up_off_alt' }}</mat-icon>
            {{ post()!.likesCount }}
          </button>
          <button mat-button><mat-icon>comment</mat-icon> {{ post()!.commentsCount }}</button>
          <button mat-button (click)="showReport.set(true)">
            <mat-icon>flag</mat-icon> Report
          </button>
        </div>
      </mat-card>

      @if (showReport()) {
        <mat-card class="report-card">
          <input
            class="report-input"
            [(ngModel)]="reportReason"
            placeholder="Reason for reporting..."
          />
          <div class="report-actions">
            <button mat-button (click)="showReport.set(false)">Cancel</button>
            <button mat-flat-button color="warn" [disabled]="!reportReason" (click)="reportPost()">
              Submit Report
            </button>
          </div>
        </mat-card>
      }

      <!-- Comments -->
      <div class="comments-section">
        <h2>Comments</h2>

        <!-- New comment -->
        <div class="new-comment">
          <textarea
            class="comment-input"
            [(ngModel)]="newComment"
            rows="3"
            placeholder="Write a comment..."
          ></textarea>
          <button mat-flat-button color="primary" [disabled]="!newComment" (click)="addComment()">
            Comment
          </button>
        </div>

        <div class="comments-list">
          @for (c of comments(); track c.id) {
            <div class="comment-item">
              <div class="comment-header">
                <div class="comment-avatar">
                  {{ c.authorName?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div class="comment-meta">
                  <span class="comment-author">{{ c.authorName }}</span>
                  <span class="comment-date">{{ c.createdAt | date: 'MMM d · h:mm a' }}</span>
                </div>
              </div>
              <div class="comment-body">{{ c.content }}</div>

              <!-- Nested replies -->
              @if (c.replies && c.replies.length > 0) {
                <div class="replies">
                  @for (r of c.replies; track r.id) {
                    <div class="comment-item reply">
                      <div class="comment-header">
                        <div class="comment-avatar small">
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

              <button mat-button class="reply-btn" (click)="replyTo.set(c.id)">
                <mat-icon>reply</mat-icon> Reply
              </button>

              @if (replyTo() === c.id) {
                <div class="reply-form">
                  <textarea
                    class="comment-input"
                    [(ngModel)]="replyContent"
                    rows="2"
                    placeholder="Write a reply..."
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
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .post-card {
        border-radius: 16px !important;
        margin-top: 12px;
      }
      .post-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .author-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1565c0, #7c4dff);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        flex-shrink: 0;
      }
      .post-meta {
        display: flex;
        flex-direction: column;
      }
      .author-name {
        font-weight: 500;
      }
      .post-date {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }
      .post-title {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 12px;
        color: #1a1a2e;
      }
      .post-content {
        font-size: 15px;
        line-height: 1.7;
        color: rgba(0, 0, 0, 0.75);
        white-space: pre-wrap;
      }
      .post-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }

      .report-card {
        border-radius: 12px !important;
        margin-top: 12px;
        padding: 16px;
      }
      .report-input {
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        outline: none;
        font-size: 14px;
      }
      .report-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }

      .comments-section {
        margin-top: 24px;
      }
      .comments-section h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 16px;
      }
      .new-comment {
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
      }
      .comment-input {
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 10px;
        padding: 12px;
        font-size: 14px;
        resize: vertical;
        outline: none;
        &:focus {
          border-color: #1565c0;
        }
      }
      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .comment-item {
        padding: 16px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .comment-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .comment-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e3f2fd;
        color: #1565c0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 13px;
        &.small {
          width: 26px;
          height: 26px;
          font-size: 11px;
        }
      }
      .comment-meta {
        display: flex;
        flex-direction: column;
      }
      .comment-author {
        font-weight: 500;
        font-size: 13px;
      }
      .comment-date {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.4);
      }
      .comment-body {
        font-size: 14px;
        line-height: 1.5;
        color: rgba(0, 0, 0, 0.7);
      }
      .reply-btn {
        margin-top: 8px;
        font-size: 12px;
      }
      .replies {
        margin-top: 12px;
        margin-left: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reply {
        background: rgba(0, 0, 0, 0.02);
      }
      .reply-form {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
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
