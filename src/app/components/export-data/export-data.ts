import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

import { CycleData, Transaction } from '../../models/expense.model';

interface AndroidExportOptions {
  filename: string;
  content: string;
  mimeType: string;
  title: string;
}

interface AndroidExportPlugin {
  exportText(options: AndroidExportOptions): Promise<void>;
  exportPdf(options: Omit<AndroidExportOptions, 'mimeType'>): Promise<void>;
}

interface CapacitorBridge {
  getPlatform?: () => string;
  isNativePlatform?: () => boolean;
  Plugins?: {
    ExpenzoExport?: AndroidExportPlugin;
  };
}

declare global {
  interface Window {
    Capacitor?: CapacitorBridge;
  }
}

@Component({
  selector: 'app-export-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="export-section">
      <div class="export-card">
        <h3 class="export-title">Export Data</h3>
        <div class="export-actions">
          <button type="button" class="export-btn csv" [disabled]="busy()" (click)="onExportCSV()">
            <span class="export-icon">📊</span>
            Export CSV
          </button>
          <button
            type="button"
            class="export-btn pdf"
            [disabled]="busy()"
            (click)="onExportReport()"
          >
            <span class="export-icon">📄</span>
            Export Report
          </button>
        </div>
        @if (toast()) {
          <p class="export-toast" [class.error]="toastError()" role="status">{{ toast() }}</p>
        }
      </div>
    </section>
  `,
  styleUrl: './export-data.scss',
})
export class ExportData {
  readonly cycle = input.required<CycleData>();

  protected readonly busy = signal(false);
  protected readonly toast = signal('');
  protected readonly toastError = signal(false);

  /**
   * Export CSV — share on Android, download on desktop.
   * Uses .then()/.catch() (not async/await) to guarantee the
   * browser's "user activation" flag is still valid when
   * navigator.share() is called.
   */
  protected onExportCSV(): void {
    this.busy.set(true);
    this.clearToast();

    const csv = this.buildCSV();
    const filename = `expenses-${this.cycle().label}.csv`;
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });

    if (this.isAndroid()) {
      this.tryAndroidExport({
        filename,
        content: '\uFEFF' + csv,
        mimeType: 'text/csv',
        title: `Expenzo CSV - ${this.cycle().label}`,
      })
        .then((handled) => {
          if (handled) return;
          return this.tryShareFile(blob, filename).then((shared) => {
            if (shared) return;
            this.triggerDownload(blob, filename);
          });
        })
        .catch(() => this.showToast('Export failed', true))
        .finally(() => this.busy.set(false));
      return;
    }

    this.tryShareFile(blob, filename)
      .then((shared) => {
        if (shared) return;
        // Desktop fallback — blob download
        this.triggerDownload(blob, filename);
      })
      .catch(() => {
        // Both share and download failed (Android WebView) — clipboard fallback
        return navigator.clipboard.writeText(csv).then(
          () => this.showToast('📋 CSV copied to clipboard'),
          () => this.showToast('❌ Export failed', true),
        );
      })
      .finally(() => this.busy.set(false));
  }

  /**
   * Export expense report — share on Android, print on desktop.
   */
  protected onExportReport(): void {
    this.busy.set(true);
    this.clearToast();

    const html = this.buildReportHTML();
    const filename = `expenzo-report-${this.cycle().label}.html`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

    if (this.isAndroid()) {
      this.tryAndroidPdfExport({
        filename: `expenzo-report-${this.cycle().label}.pdf`,
        content: this.buildReportText(),
        title: `Expenzo Report - ${this.cycle().label}`,
      })
        .then((handled) => {
          if (handled) return;
          return this.tryShareFile(blob, filename).then((shared) => {
            if (shared) return;
            this.printViaIframe(html);
          });
        })
        .catch(() => this.showToast('Export failed', true))
        .finally(() => this.busy.set(false));
      return;
    }

    this.tryShareFile(blob, filename)
      .then((shared) => {
        if (shared) return;
        // Desktop fallback — iframe print / save-as-PDF
        this.printViaIframe(html);
      })
      .catch(() => {
        this.showToast('❌ Export failed', true);
      })
      .finally(() => this.busy.set(false));
  }

  // ── Share / Download helpers ──

  private isAndroid(): boolean {
    const capacitor = window.Capacitor;
    return capacitor?.isNativePlatform?.() === true && capacitor.getPlatform?.() === 'android';
  }

  private tryAndroidExport(options: AndroidExportOptions): Promise<boolean> {
    const plugin = window.Capacitor?.Plugins?.ExpenzoExport;
    if (!plugin) {
      return Promise.resolve(false);
    }

    return plugin.exportText(options).then(() => {
      this.showToast('Choose an app to save or share');
      return true;
    });
  }

  private tryAndroidPdfExport(options: Omit<AndroidExportOptions, 'mimeType'>): Promise<boolean> {
    const plugin = window.Capacitor?.Plugins?.ExpenzoExport;
    if (!plugin) {
      return Promise.resolve(false);
    }

    return plugin.exportPdf(options).then(() => {
      this.showToast('Choose an app to save or share');
      return true;
    });
  }

  /**
   * Try the Web Share API with a file.
   * Returns true if the share dialog was shown (even if user cancelled).
   * Returns false if sharing is unavailable so the caller can try a fallback.
   * Throws only if something truly unexpected happens.
   */
  private tryShareFile(blob: Blob, filename: string): Promise<boolean> {
    // navigator.share must exist
    if (typeof navigator.share !== 'function') {
      return Promise.resolve(false);
    }

    const file = new File([blob], filename, { type: blob.type });

    // If canShare exists, use it to check file support without consuming user activation
    if (typeof navigator.canShare === 'function') {
      try {
        if (!navigator.canShare({ files: [file] })) {
          return Promise.resolve(false);
        }
      } catch {
        return Promise.resolve(false);
      }
    }

    // Call share — this consumes user activation
    return navigator
      .share({ files: [file], title: `Expenzo – ${this.cycle().label}` })
      .then(() => {
        this.showToast('✅ Shared successfully');
        return true;
      })
      .catch((e: unknown) => {
        // User cancelled — still counts as "handled"
        if (e instanceof DOMException && e.name === 'AbortError') {
          return true;
        }
        // Real failure — let caller try fallback
        return false;
      });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 300);
  }

  private printViaIframe(html: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;width:0;height:0;border:none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.print();
      const cleanup = () => {
        try {
          document.body.removeChild(iframe);
        } catch {
          /* already removed */
        }
      };
      iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true });
      setTimeout(cleanup, 10_000);
    }, 400);
  }

  // ── Toast ──

  private showToast(msg: string, isError = false): void {
    this.toast.set(msg);
    this.toastError.set(isError);
    setTimeout(() => this.clearToast(), 3500);
  }

  private clearToast(): void {
    this.toast.set('');
    this.toastError.set(false);
  }

  // ── Data builders ──

  private buildCSV(): string {
    const txs = this.cycle().transactions;
    const header = 'Date,Name,Category,Amount\n';
    const rows = txs
      .map((tx: Transaction) => {
        const date = new Date(tx.date).toLocaleDateString('en-IN');
        const name = `"${tx.name.replace(/"/g, '""')}"`;
        return `${date},${name},${tx.category},${tx.price}`;
      })
      .join('\n');
    return header + rows;
  }

  private buildReportHTML(): string {
    const cycle = this.cycle();
    const txs = cycle.transactions;

    let h = `<!DOCTYPE html><html><head><meta charset="utf-8">`;
    h += `<title>Expenzo – ${this.esc(cycle.label)}</title>`;
    h += `<style>
      body{font-family:system-ui,sans-serif;padding:20px;font-size:12px;color:#222}
      h1{color:#2e7d32;font-size:18px}
      h2{font-size:14px;margin-top:20px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
      th{background:#f5f5f5;font-weight:600}
      .summary{margin:10px 0}
      .summary span{margin-right:20px}
    </style></head><body>`;
    h += `<h1>Expense Report – ${this.esc(cycle.label)}</h1>`;
    h += `<div class="summary">`;
    h += `<span><strong>Income:</strong> ₹${cycle.summary.totalIncome.toLocaleString('en-IN')}</span>`;
    h += `<span><strong>Expense:</strong> ₹${cycle.summary.totalExpense.toLocaleString('en-IN')}</span>`;
    h += `<span><strong>Savings:</strong> ₹${cycle.summary.savings.toLocaleString('en-IN')}</span>`;
    h += `</div>`;

    h += `<h2>Category Breakdown</h2><table><tr><th>Category</th><th>Spent</th><th>Budget</th></tr>`;
    for (const cat of cycle.categorySummary) {
      h += `<tr><td>${this.esc(cat.category)}</td><td>₹${cat.spent.toLocaleString('en-IN')}</td><td>₹${cat.limit.toLocaleString('en-IN')}</td></tr>`;
    }
    h += `</table>`;

    h += `<h2>Transactions</h2><table><tr><th>Date</th><th>Name</th><th>Category</th><th>Amount</th></tr>`;
    for (const tx of txs) {
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      h += `<tr><td>${this.esc(date)}</td><td>${this.esc(tx.name)}</td><td>${this.esc(tx.category)}</td><td>₹${tx.price.toLocaleString('en-IN')}</td></tr>`;
    }
    h += `</table></body></html>`;
    return h;
  }

  private buildReportText(): string {
    const cycle = this.cycle();
    const lines = [
      'Summary',
      `Income: ${this.formatCurrency(cycle.summary.totalIncome)}`,
      `Expense: ${this.formatCurrency(cycle.summary.totalExpense)}`,
      `Savings: ${this.formatCurrency(cycle.summary.savings)}`,
      '',
      'Category Breakdown',
      'Category | Spent | Budget',
      ...cycle.categorySummary.map(
        (cat) =>
          `${cat.category} | ${this.formatCurrency(cat.spent)} | ${this.formatCurrency(cat.limit)}`,
      ),
      '',
      'Transactions',
      'Date | Name | Category | Amount',
      ...cycle.transactions.map((tx) => {
        const date = new Date(tx.date).toLocaleDateString('en-IN');
        return `${date} | ${tx.name} | ${tx.category} | ${this.formatCurrency(tx.price)}`;
      }),
    ];

    return lines.join('\n');
  }

  private formatCurrency(value: number): string {
    return `INR ${value.toLocaleString('en-IN')}`;
  }

  private esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
