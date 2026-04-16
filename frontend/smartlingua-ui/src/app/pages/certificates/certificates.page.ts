import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiClient } from '../../api/api-client.service';
import { Certificate, UUID } from '../../api/api.models';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-certificates-page',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="page-title">Certificates</div>
      <div class="page-subtitle">
        {{ auth.isStudent ? 'Your certificates' : 'Intended users: Teacher / Admin' }}
      </div>
    </div>

    <mat-card>
      <mat-card-title class="title-row">
        <span>{{ auth.isStudent ? 'My certificates' : 'Certificates' }}</span>
        <span class="spacer"></span>
        <button mat-stroked-button type="button" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </mat-card-title>

      <mat-card-content>
        <ng-container *ngIf="auth.isStudent; else staffTable">
          <table mat-table [dataSource]="certificates()" class="table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Certificate</th>
              <td mat-cell *matCellDef="let c">
                <div class="mono">{{ c.id }}</div>
                <div class="sub mono">Attempt: {{ c.examAttemptId }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="issuedAt">
              <th mat-header-cell *matHeaderCellDef>Issued</th>
              <td mat-cell *matCellDef="let c">{{ formatDate(c.issuedAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="skillLevel">
              <th mat-header-cell *matHeaderCellDef>Skill</th>
              <td mat-cell *matCellDef="let c">{{ c.skillLevel }}</td>
            </ng-container>

            <ng-container matColumnDef="valid">
              <th mat-header-cell *matHeaderCellDef>Signature</th>
              <td mat-cell *matCellDef="let c">{{ validity()[c.id] || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c" class="row-actions">
                <button mat-button type="button" (click)="verify(c.id)">
                  <mat-icon>verified</mat-icon>
                  Verify
                </button>
                <a
                  mat-raised-button
                  color="primary"
                  [href]="downloadUrl(c.id)"
                  target="_blank"
                  rel="noopener"
                >
                  <mat-icon>download</mat-icon>
                  PDF
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </ng-container>

        <ng-template #staffTable>
          <table mat-table [dataSource]="certificates()" class="table">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Certificate</th>
              <td mat-cell *matCellDef="let c">
                <div class="mono">{{ c.id }}</div>
                <div class="sub mono">Attempt: {{ c.examAttemptId }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="studentId">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let c">
                <div class="mono">{{ c.studentId }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="issuedAt">
              <th mat-header-cell *matHeaderCellDef>Issued</th>
              <td mat-cell *matCellDef="let c">{{ formatDate(c.issuedAt) }}</td>
            </ng-container>

            <ng-container matColumnDef="skillLevel">
              <th mat-header-cell *matHeaderCellDef>Skill</th>
              <td mat-cell *matCellDef="let c">{{ c.skillLevel }}</td>
            </ng-container>

            <ng-container matColumnDef="valid">
              <th mat-header-cell *matHeaderCellDef>Signature</th>
              <td mat-cell *matCellDef="let c">{{ validity()[c.id] || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c" class="row-actions">
                <button mat-button type="button" (click)="verify(c.id)">
                  <mat-icon>verified</mat-icon>
                  Verify
                </button>
                <a
                  mat-raised-button
                  color="primary"
                  [href]="downloadUrl(c.id)"
                  target="_blank"
                  rel="noopener"
                >
                  <mat-icon>download</mat-icon>
                  PDF
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .title-row {
        display: flex;
        align-items: center;
      }
      .page-header {
        display: grid;
        gap: 4px;
        margin-bottom: 12px;
      }
      .page-title {
        font-size: 20px;
        font-weight: 500;
        line-height: 28px;
      }
      .page-subtitle {
        opacity: 0.8;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .table {
        width: 100%;
      }
      .row-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .mono {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
          monospace;
        font-size: 12px;
        overflow-wrap: anywhere;
      }
      .sub {
        opacity: 0.75;
      }
    `,
  ],
})
export class CertificatesPage {
  readonly auth = inject(AuthService);

  private readonly api = inject(ApiClient);
  private readonly snack = inject(MatSnackBar);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly certificates = signal<Certificate[]>([]);
  readonly validity = signal<Record<UUID, string>>({});

  readonly displayedColumns = this.auth.isStudent
    ? ['id', 'issuedAt', 'skillLevel', 'valid', 'actions']
    : ['id', 'studentId', 'issuedAt', 'skillLevel', 'valid', 'actions'];

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const req$ = this.auth.isStudent ? this.api.listMyCertificates() : this.api.listCertificates();

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.certificates.set(data),
      error: () => this.snack.open('Failed to load certificates', 'Dismiss', { duration: 4000 }),
    });
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'medium') ?? value;
  }

  verify(id: UUID): void {
    const req$ = this.auth.isStudent
      ? this.api.verifyMyCertificate(id)
      : this.api.verifyCertificate(id);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.validity.update((m) => ({ ...m, [id]: res.valid ? 'Valid' : 'Invalid' }));
        this.snack.open(res.valid ? 'Signature valid' : 'Signature invalid', 'Dismiss', {
          duration: 3000,
        });
      },
      error: (err) =>
        this.snack.open(err?.error?.message ?? 'Failed to verify', 'Dismiss', { duration: 5000 }),
    });
  }

  downloadUrl(id: UUID): string {
    return this.auth.isStudent
      ? this.api.getMyCertificateDownloadUrl(id)
      : this.api.getCertificateDownloadUrl(id);
  }
}
