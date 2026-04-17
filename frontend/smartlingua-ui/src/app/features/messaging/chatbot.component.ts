import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

import { MessagingApiService } from '../../services/messaging-api.service';
import { ChatbotResponse } from '../../models';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="chatbot-container">
      <div class="chatbot-header">
        <div class="bot-avatar">
          <mat-icon>smart_toy</mat-icon>
        </div>
        <div>
          <h2>AI Language Assistant</h2>
          <span class="status">Online</span>
        </div>
      </div>

      <div class="messages-area">
        @if (chatMessages().length === 0) {
          <div class="welcome">
            <mat-icon class="welcome-icon">school</mat-icon>
            <h3>Hi! I'm your language learning assistant</h3>
            <p>Ask me anything about grammar, vocabulary, or language learning tips</p>
            <div class="suggestions">
              @for (s of suggestions; track s) {
                <button mat-stroked-button (click)="sendSuggestion(s)">{{ s }}</button>
              }
            </div>
          </div>
        }

        @for (m of chatMessages(); track $index) {
          <div class="chat-msg" [class.user]="m.role === 'user'" [class.bot]="m.role === 'bot'">
            @if (m.role === 'bot') {
              <div class="bot-avatar-sm"><mat-icon>smart_toy</mat-icon></div>
            }
            <div class="msg-bubble">
              <p>{{ m.content }}</p>
              <span class="msg-time">{{ m.timestamp | date: 'h:mm a' }}</span>
            </div>
          </div>
        }

        @if (loading()) {
          <div class="chat-msg bot">
            <div class="bot-avatar-sm"><mat-icon>smart_toy</mat-icon></div>
            <div class="msg-bubble typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        }
      </div>

      <div class="input-area">
        <input
          [(ngModel)]="userInput"
          placeholder="Ask me something..."
          (keyup.enter)="send()"
          [disabled]="loading()"
        />
        <button
          mat-icon-button
          color="primary"
          (click)="send()"
          [disabled]="!userInput || loading()"
        >
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100vh - 120px);
      }
      .chatbot-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      }

      .chatbot-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
      }
      .bot-avatar {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #1565c0, #7c4dff);
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon {
          color: white;
        }
      }
      .status {
        font-size: 12px;
        color: #4caf50;
      }

      .messages-area {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .welcome {
        text-align: center;
        padding: 40px 20px;
        .welcome-icon {
          font-size: 56px;
          width: 56px;
          height: 56px;
          color: #1565c0;
        }
        h3 {
          font-size: 20px;
          margin: 16px 0 8px;
        }
        p {
          color: rgba(0, 0, 0, 0.55);
          margin-bottom: 20px;
        }
      }
      .suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      }

      .chat-msg {
        display: flex;
        gap: 8px;
      }
      .chat-msg.user {
        justify-content: flex-end;
      }
      .bot-avatar-sm {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: linear-gradient(135deg, #1565c0, #7c4dff);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: white;
        }
      }
      .msg-bubble {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 16px;
        p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
      }
      .user .msg-bubble {
        background: #1565c0;
        color: white;
        border-bottom-right-radius: 4px;
      }
      .bot .msg-bubble {
        background: rgba(0, 0, 0, 0.04);
        border-bottom-left-radius: 4px;
      }
      .msg-time {
        font-size: 10px;
        opacity: 0.5;
        display: block;
        margin-top: 4px;
      }

      .typing {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 16px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.3);
        animation: bounce 1.2s infinite;
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
      @keyframes bounce {
        0%,
        60%,
        100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-6px);
        }
      }

      .input-area {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        input {
          flex: 1;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 24px;
          padding: 10px 18px;
          font-size: 14px;
          outline: none;
          &:focus {
            border-color: #1565c0;
          }
        }
      }
    `,
  ],
})
export class ChatbotComponent {
  private readonly msgApi = inject(MessagingApiService);

  chatMessages = signal<ChatMessage[]>([]);
  loading = signal(false);
  userInput = '';

  suggestions = [
    'How to conjugate French verbs?',
    'Explain the subjunctive mood',
    'Tips for learning vocabulary',
    'Common English idioms',
  ];

  sendSuggestion(text: string): void {
    this.userInput = text;
    this.send();
  }

  send(): void {
    if (!this.userInput.trim() || this.loading()) return;
    const text = this.userInput.trim();
    this.userInput = '';

    this.chatMessages.update((msgs) => [
      ...msgs,
      { role: 'user', content: text, timestamp: new Date() },
    ]);
    this.loading.set(true);

    this.msgApi.sendChatbotMessage(0, text, 'B1').subscribe({
      next: (res: ChatbotResponse) => {
        this.chatMessages.update((msgs) => [
          ...msgs,
          { role: 'bot', content: res.reply, timestamp: new Date() },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.chatMessages.update((msgs) => [
          ...msgs,
          {
            role: 'bot',
            content: 'Sorry, I had trouble responding. Please try again.',
            timestamp: new Date(),
          },
        ]);
        this.loading.set(false);
      },
    });
  }
}
