import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { QuizApiService } from '../../services/quiz-api.service';
import { Question } from '../../models';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  template: `
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>Question Bank</h1>
          <p>Manage quiz questions</p>
        </div>
        <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancel' : 'Add Question' }}
        </button>
      </div>
    </div>

    <!-- Add/Edit Form -->
    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="saveQuestion()" class="q-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Question Text</mat-label>
              <textarea matInput formControlName="questionText" rows="3"></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Level</mat-label>
                <mat-select formControlName="level">
                  @for (l of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']; track l) {
                    <mat-option [value]="l">{{ l }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Skill Type</mat-label>
                <mat-select formControlName="skillType">
                  @for (s of ['READING', 'WRITING', 'LISTENING']; track s) {
                    <mat-option [value]="s">{{ s }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Correct Answer</mat-label>
                <mat-select formControlName="correctAnswer">
                  @for (o of ['A', 'B', 'C', 'D']; track o) {
                    <mat-option [value]="o">{{ o }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              @for (
                opt of [
                  ['optionA', 'Option A'],
                  ['optionB', 'Option B'],
                  ['optionC', 'Option C'],
                  ['optionD', 'Option D'],
                ];
                track opt[0]
              ) {
                <mat-form-field appearance="outline">
                  <mat-label>{{ opt[1] }}</mat-label>
                  <input matInput [formControlName]="opt[0]" />
                </mat-form-field>
              }
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ editingId() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <!-- Filters -->
    <div class="filters">
      <mat-form-field appearance="outline">
        <mat-label>Level</mat-label>
        <mat-select [(value)]="filterLevel" (selectionChange)="loadQuestions()">
          <mat-option>All</mat-option>
          @for (l of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']; track l) {
            <mat-option [value]="l">{{ l }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Skill</mat-label>
        <mat-select [(value)]="filterSkill" (selectionChange)="loadQuestions()">
          <mat-option>All</mat-option>
          @for (s of ['READING', 'WRITING', 'LISTENING']; track s) {
            <mat-option [value]="s">{{ s }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    <!-- Questions Table -->
    <mat-card class="table-card">
      <table mat-table [dataSource]="questions()" class="q-table">
        <ng-container matColumnDef="questionText">
          <th mat-header-cell *matHeaderCellDef>Question</th>
          <td mat-cell *matCellDef="let q">
            {{ q.questionText | slice: 0 : 80 }}{{ q.questionText.length > 80 ? '...' : '' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="level">
          <th mat-header-cell *matHeaderCellDef>Level</th>
          <td mat-cell *matCellDef="let q">
            <span class="level-chip">{{ q.level }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="skillType">
          <th mat-header-cell *matHeaderCellDef>Skill</th>
          <td mat-cell *matCellDef="let q">{{ q.skillType }}</td>
        </ng-container>
        <ng-container matColumnDef="correctAnswer">
          <th mat-header-cell *matHeaderCellDef>Answer</th>
          <td mat-cell *matCellDef="let q">
            <strong>{{ q.correctAnswer }}</strong>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let q">
            <button mat-icon-button (click)="editQuestion(q)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteQuestion(q.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
    </mat-card>
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
      .form-card {
        margin-bottom: 24px;
        border-radius: 16px !important;
      }
      .q-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .full-width {
        width: 100%;
      }
      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }
      .table-card {
        border-radius: 16px !important;
        overflow: hidden;
      }
      .q-table {
        width: 100%;
      }
      .level-chip {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        background: #e3f2fd;
        color: #1565c0;
      }
    `,
  ],
})
export class QuestionBankComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly quizApi = inject(QuizApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  questions = signal<Question[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  filterLevel: string | undefined;
  filterSkill: string | undefined;

  columns = ['questionText', 'level', 'skillType', 'correctAnswer', 'actions'];

  form = this.fb.group({
    questionText: ['', Validators.required],
    level: ['A1', Validators.required],
    skillType: ['READING', Validators.required],
    correctAnswer: ['A', Validators.required],
    optionA: ['', Validators.required],
    optionB: ['', Validators.required],
    optionC: ['', Validators.required],
    optionD: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.quizApi.listQuestions(this.filterLevel, this.filterSkill).subscribe({
      next: (q) => this.questions.set(q),
      error: () => this.snack.open('Failed to load questions', 'OK', { duration: 3000 }),
    });
  }

  saveQuestion(): void {
    if (this.form.invalid) return;
    const val = this.form.value as any;
    const op$ = this.editingId()
      ? this.quizApi.updateQuestion(this.editingId()!, val)
      : this.quizApi.createQuestion(val);

    op$.subscribe({
      next: () => {
        this.snack.open('Question saved', 'OK', { duration: 3000 });
        this.cancelForm();
        this.loadQuestions();
      },
      error: () => this.snack.open('Failed to save question', 'OK', { duration: 3000 }),
    });
  }

  editQuestion(q: Question): void {
    this.editingId.set(q.id);
    this.form.patchValue(q as any);
    this.showForm.set(true);
  }

  deleteQuestion(id: number): void {
    this.quizApi.deleteQuestion(id).subscribe({
      next: () => {
        this.loadQuestions();
        this.snack.open('Deleted', 'OK', { duration: 2000 });
      },
      error: () => this.snack.open('Failed to delete', 'OK', { duration: 3000 }),
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ level: 'A1', skillType: 'READING', correctAnswer: 'A' });
  }
}
