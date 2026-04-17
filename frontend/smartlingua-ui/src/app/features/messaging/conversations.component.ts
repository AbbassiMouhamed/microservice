import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

import { MessagingApiService } from '../../services/messaging-api.service';
import { Conversation, Message, MsgUser } from '../../models';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatTabsModule,
  ],
  template: `
    <div class="chat-layout">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Messages</h2>
        </div>

        <mat-tab-group class="sidebar-tabs" (selectedIndexChange)="onTabChange($event)">
          <!-- Conversations Tab -->
          <mat-tab label="Chats">
            <div class="tab-content">
              <div class="conv-list">
                @for (c of conversations(); track c.id) {
                  <div
                    class="conv-item"
                    [class.active]="selectedId() === c.id"
                    (click)="selectConversation(c)"
                  >
                    <div class="conv-avatar">
                      {{ getConvInitial(c) }}
                    </div>
                    <div class="conv-info">
                      <span class="conv-name">{{ getConvName(c) }}</span>
                      <span class="conv-preview">{{
                        c.lastMessagePreview || 'No messages yet'
                      }}</span>
                    </div>
                    @if (c.unreadCount) {
                      <span class="unread-badge">{{ c.unreadCount }}</span>
                    }
                  </div>
                }
                @if (conversations().length === 0) {
                  <div class="empty-sidebar">
                    <mat-icon>chat_bubble_outline</mat-icon>
                    <p>No conversations yet</p>
                    <span class="hint">Select a user from the Users tab to start chatting</span>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <!-- Users Tab -->
          <mat-tab label="Users">
            <div class="tab-content">
              <div class="search-box">
                <mat-icon>search</mat-icon>
                <input [(ngModel)]="userSearch" placeholder="Search users..." />
              </div>
              <div class="user-list">
                @for (u of filteredUsers(); track u.id) {
                  <div
                    class="user-item"
                    [class.active]="selectedUserId() === u.id"
                    (click)="selectUser(u)"
                  >
                    <div class="user-avatar" [class]="'role-' + u.role">
                      {{ u.username.charAt(0).toUpperCase() }}
                    </div>
                    <div class="user-info">
                      <span class="user-name">{{ u.username }}</span>
                      <span class="user-role">{{ u.role }}</span>
                    </div>
                    <div class="online-dot" [class.online]="onlineIds().includes(u.id)"></div>
                  </div>
                }
                @if (filteredUsers().length === 0) {
                  <div class="empty-sidebar">
                    <mat-icon>people_outline</mat-icon>
                    <p>No users found</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        @if (selectedId() || selectedUserId()) {
          <div class="chat-header">
            <div class="chat-header-info">
              <div class="chat-avatar">{{ chatPartnerInitial() }}</div>
              <div>
                <h3>{{ chatPartnerName() }}</h3>
                <span class="chat-status">{{ chatPartnerOnline() ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
          </div>
          <div class="messages-container">
            @for (m of messages(); track m.id) {
              <div
                class="message"
                [class.mine]="m.senderId === currentUserId"
                [class.theirs]="m.senderId !== currentUserId"
              >
                <div class="msg-bubble">
                  <p>{{ m.content }}</p>
                  <span class="msg-time">{{ m.timestamp | date: 'h:mm a' }}</span>
                </div>
              </div>
            }
            @if (messages().length === 0 && selectedUserId()) {
              <div class="no-messages">
                <mat-icon>waving_hand</mat-icon>
                <p>Start a conversation with {{ chatPartnerName() }}</p>
              </div>
            }
          </div>
          <div class="chat-input">
            <input
              [(ngModel)]="newMessage"
              placeholder="Type a message..."
              (keyup.enter)="sendMessage()"
            />
            <button
              mat-icon-button
              color="primary"
              (click)="sendMessage()"
              [disabled]="!newMessage.trim()"
            >
              <mat-icon>send</mat-icon>
            </button>
          </div>
        } @else {
          <div class="no-selection">
            <mat-icon>forum</mat-icon>
            <h3>Select a conversation</h3>
            <p>Choose a chat or pick a user to start messaging</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100vh - 120px);
      }
      .chat-layout {
        display: flex;
        height: 100%;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        background: white;
      }

      /* ── Sidebar ── */
      .sidebar {
        width: 340px;
        min-width: 340px;
        border-right: 1px solid rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        background: #fafbff;
      }
      .sidebar-header {
        padding: 20px 20px 12px;
        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a2e;
        }
      }
      .sidebar-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .tab-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 12px 16px;
        padding: 8px 14px;
        border-radius: 12px;
        background: white;
        border: 1px solid rgba(0, 0, 0, 0.08);
        mat-icon {
          color: rgba(0, 0, 0, 0.35);
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
        input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
        }
      }

      .conv-list,
      .user-list {
        flex: 1;
        overflow-y: auto;
        padding: 4px 0;
      }

      .conv-item,
      .user-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        cursor: pointer;
        transition: background 0.12s;
        &:hover {
          background: rgba(21, 101, 192, 0.04);
        }
        &.active {
          background: rgba(21, 101, 192, 0.08);
        }
      }

      .conv-avatar,
      .user-avatar,
      .chat-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        flex-shrink: 0;
        background: linear-gradient(135deg, #1565c0, #7c4dff);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
      }
      .user-avatar.role-admin {
        background: linear-gradient(135deg, #e65100, #f57c00);
      }
      .user-avatar.role-teacher {
        background: linear-gradient(135deg, #2e7d32, #43a047);
      }
      .chat-avatar {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }

      .conv-info,
      .user-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .conv-name,
      .user-name {
        font-weight: 500;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #1a1a2e;
      }
      .conv-preview {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-role {
        font-size: 11px;
        text-transform: capitalize;
        color: rgba(0, 0, 0, 0.4);
      }

      .online-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ccc;
        flex-shrink: 0;
        &.online {
          background: #4caf50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.25);
        }
      }

      .unread-badge {
        background: #1565c0;
        color: white;
        border-radius: 10px;
        min-width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
      }

      .empty-sidebar {
        text-align: center;
        padding: 40px 20px;
        color: rgba(0, 0, 0, 0.35);
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
        }
        p {
          font-size: 13px;
          margin: 8px 0 4px;
        }
        .hint {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.3);
        }
      }

      /* ── Chat Area ── */
      .chat-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .chat-header {
        padding: 14px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        background: white;
      }
      .chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
        h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1a1a2e;
        }
      }
      .chat-status {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.4);
      }

      .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: #f8f9fc;
      }
      .message {
        display: flex;
      }
      .message.mine {
        justify-content: flex-end;
      }
      .msg-bubble {
        max-width: 65%;
        padding: 10px 16px;
        border-radius: 16px;
        p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
      }
      .mine .msg-bubble {
        background: #1565c0;
        color: white;
        border-bottom-right-radius: 4px;
      }
      .theirs .msg-bubble {
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border-bottom-left-radius: 4px;
      }
      .msg-time {
        font-size: 10px;
        opacity: 0.6;
        display: block;
        margin-top: 4px;
      }
      .no-messages {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: rgba(0, 0, 0, 0.3);
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
        }
        p {
          font-size: 14px;
        }
      }

      .chat-input {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: white;
        input {
          flex: 1;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 24px;
          padding: 10px 18px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          &:focus {
            border-color: #1565c0;
          }
        }
      }

      .no-selection {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: rgba(0, 0, 0, 0.3);
        mat-icon {
          font-size: 56px;
          width: 56px;
          height: 56px;
        }
        h3 {
          margin: 16px 0 4px;
        }
        p {
          font-size: 13px;
        }
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 72px;
          min-width: 72px;
        }
        .conv-info,
        .user-info,
        .sidebar-header h2,
        .search-box {
          display: none;
        }
        .conv-item,
        .user-item {
          justify-content: center;
          padding: 12px;
        }
      }
    `,
  ],
})
export class ConversationsComponent implements OnInit {
  private readonly msgApi = inject(MessagingApiService);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  users = signal<MsgUser[]>([]);
  onlineIds = signal<number[]>([]);
  selectedId = signal<number | null>(null);
  selectedConv = signal<Conversation | null>(null);
  selectedUserId = signal<number | null>(null);
  selectedUser = signal<MsgUser | null>(null);
  newMessage = '';
  userSearch = '';
  currentUserId = 1; // Placeholder — derived from auth in production

  filteredUsers = computed(() => {
    const search = this.userSearch.toLowerCase();
    return this.users().filter(
      (u) => u.id !== this.currentUserId && u.username.toLowerCase().includes(search),
    );
  });

  chatPartnerName = computed(() => {
    if (this.selectedUser()) return this.selectedUser()!.username;
    const c = this.selectedConv();
    if (!c) return '';
    const otherId = c.participant1Id === this.currentUserId ? c.participant2Id : c.participant1Id;
    const found = this.users().find((u) => u.id === otherId);
    return found ? found.username : 'User ' + otherId;
  });

  chatPartnerInitial = computed(() => {
    const name = this.chatPartnerName();
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  chatPartnerOnline = computed(() => {
    const user = this.selectedUser();
    if (user) return this.onlineIds().includes(user.id);
    const c = this.selectedConv();
    if (!c) return false;
    const otherId = c.participant1Id === this.currentUserId ? c.participant2Id : c.participant1Id;
    return this.onlineIds().includes(otherId);
  });

  ngOnInit(): void {
    this.msgApi.getAllUsers().subscribe({
      next: (u) => this.users.set(u),
      error: () => {},
    });
    this.msgApi.getOnlineUsers().subscribe({
      next: (ids) => this.onlineIds.set(ids),
      error: () => {},
    });
    this.msgApi.getUserConversations(this.currentUserId).subscribe({
      next: (c: Conversation[]) => this.conversations.set(c),
      error: () => {},
    });
  }

  onTabChange(_index: number): void {
    // Reset selection when switching tabs
  }

  selectConversation(c: Conversation): void {
    this.selectedId.set(c.id);
    this.selectedConv.set(c);
    this.selectedUserId.set(null);
    this.selectedUser.set(null);
    this.msgApi.getConversationMessages(c.id).subscribe({
      next: (m) => this.messages.set(m),
      error: () => {},
    });
  }

  selectUser(u: MsgUser): void {
    this.selectedUserId.set(u.id);
    this.selectedUser.set(u);
    this.selectedId.set(null);
    this.selectedConv.set(null);
    this.messages.set([]);
    // Try to load existing conversation
    this.msgApi.getConversationBetween(this.currentUserId, u.id).subscribe({
      next: (conv) => {
        this.selectedId.set(conv.id);
        this.selectedConv.set(conv);
        this.msgApi.getConversationMessages(conv.id).subscribe({
          next: (m) => this.messages.set(m),
          error: () => {},
        });
      },
      error: () => {
        // No existing conversation — will be created on first message
      },
    });
  }

  getConvInitial(c: Conversation): string {
    const otherId = c.participant1Id === this.currentUserId ? c.participant2Id : c.participant1Id;
    const found = this.users().find((u) => u.id === otherId);
    return found ? found.username.charAt(0).toUpperCase() : '?';
  }

  getConvName(c: Conversation): string {
    const otherId = c.participant1Id === this.currentUserId ? c.participant2Id : c.participant1Id;
    const found = this.users().find((u) => u.id === otherId);
    return found ? found.username : 'User ' + otherId;
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    if (this.selectedId()) {
      this.msgApi
        .sendMessageToConversation(this.selectedId()!, this.currentUserId, this.newMessage)
        .subscribe({
          next: (m) => {
            this.messages.update((msgs) => [...msgs, m]);
            this.newMessage = '';
          },
        });
    } else if (this.selectedUserId()) {
      this.msgApi
        .sendMessage(this.currentUserId, this.selectedUserId()!, this.newMessage)
        .subscribe({
          next: (m) => {
            this.messages.update((msgs) => [...msgs, m]);
            this.newMessage = '';
            // Refresh conversations
            this.msgApi.getUserConversations(this.currentUserId).subscribe({
              next: (c) => this.conversations.set(c),
              error: () => {},
            });
          },
        });
    }
  }
}
