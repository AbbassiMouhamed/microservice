import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
    MatSnackBarModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="page-header">
      <div class="header-row">
        <div>
          <h1>{{ auth.isStudent ? 'My Certificates' : 'Certificates' }}</h1>
          <p>
            {{
              auth.isStudent
                ? 'Your earned certificates and credentials'
                : 'Manage issued certificates'
            }}
          </p>
        </div>
        <button mat-stroked-button type="button" (click)="refresh()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <mat-icon class="stat-icon">workspace_premium</mat-icon>
        <div class="stat-info">
          <span class="stat-value">{{ certificates().length }}</span>
          <span class="stat-label">Total Certificates</span>
        </div>
      </div>
      <div class="stat-card">
        <mat-icon class="stat-icon verified">verified</mat-icon>
        <div class="stat-info">
          <span class="stat-value">{{ verifiedCount() }}</span>
          <span class="stat-label">Verified</span>
        </div>
      </div>
    </div>

    <!-- Certificate Cards -->
    <div class="cert-grid">
      @for (c of certificates(); track c.id) {
        <mat-card class="cert-card">
          <div class="cert-card-header">
            <div class="cert-icon-wrap">
              <mat-icon>workspace_premium</mat-icon>
            </div>
            <div class="cert-signature" [class]="'sig-' + signatureClass(c)">
              <mat-icon>{{ signatureIcon(c) }}</mat-icon>
              {{ signatureStatus(c) }}
            </div>
          </div>
          <mat-card-content>
            <h3 class="cert-title">{{ c.examTitle || 'Certificate' }}</h3>
            @if (!auth.isStudent && c.studentName) {
              <div class="cert-student">
                <mat-icon>person</mat-icon>
                <span>{{ c.studentName }}</span>
                @if (c.studentEmail) {
                  <span class="cert-email">{{ c.studentEmail }}</span>
                }
              </div>
            }
            <div class="cert-details">
              <div class="detail-item">
                <span class="detail-label">Skill Level</span>
                <span class="detail-value skill">{{ c.skillLevel || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Issued</span>
                <span class="detail-value">{{ formatDate(c.issuedAt) }}</span>
              </div>
            </div>
            <div class="cert-id">
              <mat-icon>tag</mat-icon>
              <span>{{ c.id }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions class="cert-actions">
            @if (!auth.isStudent) {
              <button mat-button type="button" (click)="verify(c.id)" matTooltip="Verify signature">
                <mat-icon>verified</mat-icon> Verify
              </button>
            }
            <span class="action-spacer"></span>
            <button
              mat-flat-button
              color="primary"
              type="button"
              (click)="download(c)"
              matTooltip="Download PDF"
            >
              <mat-icon>download</mat-icon> PDF
            </button>
            @if (!auth.isStudent) {
              <button
                mat-icon-button
                color="warn"
                type="button"
                (click)="deleteCertificate(c)"
                matTooltip="Delete certificate"
              >
                <mat-icon>delete_outline</mat-icon>
              </button>
            }
          </mat-card-actions>
        </mat-card>
      }
    </div>

    @if (certificates().length === 0) {
      <div class="empty-state">
        <mat-icon>workspace_premium</mat-icon>
        <h3>No certificates yet</h3>
        <p>
          {{
            auth.isStudent
              ? 'Pass an exam to earn your first certificate!'
              : 'No certificates have been issued yet.'
          }}
        </p>
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
        gap: 16px;
        flex-wrap: wrap;
      }

      .stats-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 24px;
      }
      .stat-card {
        flex: 1 1 180px;
        display: flex;
        align-items: center;
        gap: 14px;
        background: #fff;
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      }
      .stat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #1565c0;
        &.verified {
          color: #2e7d32;
        }
      }
      .stat-info {
        display: flex;
        flex-direction: column;
      }
      .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
        line-height: 1;
      }
      .stat-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        margin-top: 2px;
      }

      .cert-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      .cert-card {
        flex: 1 1 340px;
        border-radius: 16px !important;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
      }
      .cert-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 20px 0;
      }
      .cert-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #ffd54f, #ffb300);
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon {
          color: #fff;
          font-size: 26px;
          width: 26px;
          height: 26px;
        }
      }
      .cert-signature {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
        &.sig-valid {
          background: #e8f5e9;
          color: #2e7d32;
        }
        &.sig-invalid {
          background: #fce4ec;
          color: #c62828;
        }
        &.sig-unknown {
          background: #f5f5f5;
          color: #757575;
        }
      }

      .cert-title {
        font-size: 17px;
        font-weight: 600;
        margin: 0 0 10px;
        color: #1a1a2e;
      }
      .cert-student {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.7);
        margin-bottom: 12px;
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: rgba(0, 0, 0, 0.4);
        }
      }
      .cert-email {
        color: rgba(0, 0, 0, 0.45);
        font-size: 13px;
        &::before {
          content: '·';
          margin: 0 4px;
        }
      }
      .cert-details {
        display: flex;
        gap: 16px;
        background: #fafbff;
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 12px;
      }
      .detail-item {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .detail-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: rgba(0, 0, 0, 0.45);
      }
      .detail-value {
        font-size: 15px;
        font-weight: 600;
        color: #1a1a2e;
        &.skill {
          color: #1565c0;
        }
      }
      .cert-id {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        color: rgba(0, 0, 0, 0.35);
        overflow-wrap: anywhere;
        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
      .cert-actions {
        display: flex;
        align-items: center;
        padding: 4px 8px !important;
        gap: 4px;
      }
      .action-spacer {
        flex: 1 1 auto;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: rgba(0, 0, 0, 0.15);
        }
        h3 {
          margin: 16px 0 8px;
          color: #1a1a2e;
        }
        p {
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
        }
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

  readonly verifiedCount = computed(
    () =>
      this.certificates().filter((c) => {
        const v = this.validity()[c.id];
        return v === 'Valid' || (c.lastVerifiedValid === true && !v);
      }).length,
  );

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

  signatureStatus(c: Certificate): string {
    const current = this.validity()[c.id];
    if (current) return current;

    if (typeof c.lastVerifiedValid === 'boolean') {
      return c.lastVerifiedValid ? 'Valid' : 'Invalid';
    }

    return 'Unknown';
  }

  signatureClass(c: Certificate): string {
    const status = this.signatureStatus(c);
    if (status === 'Valid') return 'valid';
    if (status === 'Invalid') return 'invalid';
    return 'unknown';
  }

  signatureIcon(c: Certificate): string {
    const status = this.signatureStatus(c);
    if (status === 'Valid') return 'verified';
    if (status === 'Invalid') return 'error_outline';
    return 'help_outline';
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

  download(c: Certificate): void {
    const req$ = this.auth.isStudent
      ? this.api.downloadMyCertificatePdf(c.id)
      : this.api.downloadCertificatePdf(c.id);

    req$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${c.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) =>
        this.snack.open(err?.error?.message ?? 'Failed to download PDF', 'Dismiss', {
          duration: 5000,
        }),
    });
  }

  deleteCertificate(cert: Certificate): void {
    if (this.auth.isStudent) return;
    if (!confirm(`Delete certificate "${cert.id}"?`)) return;

    this.api
      .deleteCertificate(cert.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Certificate deleted', 'Dismiss', { duration: 2500 });
          this.refresh();
        },
        error: (err) =>
          this.snack.open(err?.error?.message ?? 'Failed to delete certificate', 'Dismiss', {
            duration: 5000,
          }),
      });
  }

  downloadUrl(id: UUID): string {
    return this.auth.isStudent
      ? this.api.getMyCertificateDownloadUrl(id)
      : this.api.getCertificateDownloadUrl(id);
  }
}
