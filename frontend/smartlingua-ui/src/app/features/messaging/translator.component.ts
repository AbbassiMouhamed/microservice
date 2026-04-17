import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

import { MessagingApiService } from '../../services/messaging-api.service';
import { Language, TranslationHistoryEntry } from '../../models';

@Component({
  selector: 'app-translator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page-header">
      <h1>Translator</h1>
      <p>Translate text between languages</p>
    </div>

    <mat-card class="translator-card">
      <div class="translator-layout">
        <!-- Source -->
        <div class="lang-panel">
          <mat-form-field appearance="outline" class="lang-select">
            <mat-label>From</mat-label>
            <mat-select [(value)]="sourceLang">
              @for (l of languages(); track l.code) {
                <mat-option [value]="l.code">{{ l.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <textarea
            class="text-area"
            [(ngModel)]="sourceText"
            rows="6"
            placeholder="Enter text to translate..."
          ></textarea>
        </div>

        <button mat-icon-button class="swap-btn" (click)="swapLangs()">
          <mat-icon>swap_horiz</mat-icon>
        </button>

        <!-- Target -->
        <div class="lang-panel">
          <mat-form-field appearance="outline" class="lang-select">
            <mat-label>To</mat-label>
            <mat-select [(value)]="targetLang">
              @for (l of languages(); track l.code) {
                <mat-option [value]="l.code">{{ l.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <div class="text-area result-area" [class.has-text]="translatedText()">
            {{ translatedText() || 'Translation will appear here...' }}
          </div>
        </div>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      <div class="translate-action">
        <button
          mat-flat-button
          color="primary"
          (click)="translate()"
          [disabled]="!sourceText || loading()"
        >
          <mat-icon>translate</mat-icon> Translate
        </button>
      </div>
    </mat-card>

    <!-- History -->
    @if (history().length > 0) {
      <h2 class="section-title">Translation History</h2>
      <div class="history-list">
        @for (h of history(); track $index) {
          <mat-card class="history-card">
            <div class="history-langs">{{ h.sourceLanguage }} → {{ h.targetLanguage }}</div>
            <div class="history-texts">
              <p class="history-src">{{ h.inputText }}</p>
              <p class="history-tgt">{{ h.translatedText }}</p>
            </div>
            <span class="history-date">{{ h.createdAt | date: 'MMM d · h:mm a' }}</span>
          </mat-card>
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

      .translator-card {
        border-radius: 16px !important;
        padding: 24px;
      }
      .translator-layout {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }
      @media (max-width: 768px) {
        .translator-layout {
          flex-direction: column;
        }
        .swap-btn {
          transform: rotate(90deg);
          align-self: center;
        }
      }

      .lang-panel {
        flex: 1;
        width: 100%;
      }
      .lang-select {
        width: 100%;
      }
      .text-area {
        width: 100%;
        min-height: 140px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 12px;
        padding: 14px;
        font-size: 15px;
        line-height: 1.6;
        resize: vertical;
        outline: none;
        font-family: inherit;
        &:focus {
          border-color: #1565c0;
        }
      }
      .result-area {
        color: rgba(0, 0, 0, 0.4);
        white-space: pre-wrap;
        overflow-y: auto;
        &.has-text {
          color: rgba(0, 0, 0, 0.85);
        }
      }

      .swap-btn {
        margin-top: 38px;
      }
      .translate-action {
        text-align: center;
        margin-top: 16px;
      }

      .section-title {
        font-size: 20px;
        font-weight: 600;
        margin: 32px 0 16px;
      }
      .history-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .history-card {
        border-radius: 12px !important;
        padding: 16px;
      }
      .history-langs {
        font-size: 12px;
        font-weight: 600;
        color: #1565c0;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .history-texts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .history-src {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.6);
        margin: 0;
      }
      .history-tgt {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
        margin: 0;
      }
      .history-date {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.35);
        margin-top: 8px;
        display: block;
      }
    `,
  ],
})
export class TranslatorComponent {
  private readonly msgApi = inject(MessagingApiService);

  languages = signal<Language[]>([]);
  history = signal<TranslationHistoryEntry[]>([]);
  loading = signal(false);
  translatedText = signal('');

  sourceLang = 'en';
  targetLang = 'fr';
  sourceText = '';

  ngOnInit(): void {
    this.msgApi.getLanguages().subscribe({ next: (l) => this.languages.set(l), error: () => {} });
    // Translation history requires userId; skip if not available
    // this.msgApi.getTranslationHistory(userId).subscribe(...);
  }

  swapLangs(): void {
    const tmp = this.sourceLang;
    this.sourceLang = this.targetLang;
    this.targetLang = tmp;
  }

  translate(): void {
    if (!this.sourceText.trim()) return;
    this.loading.set(true);
    this.msgApi.translate(this.sourceText, this.sourceLang, this.targetLang).subscribe({
      next: (res: any) => {
        this.translatedText.set(res.translatedText || res);
        this.loading.set(false);
        // History refresh skipped - userId-based
      },
      error: () => this.loading.set(false),
    });
  }
}
