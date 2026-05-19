import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

import { CycleData, Transaction } from '../../models/expense.model';

@Component({
  selector: 'app-export-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="export-section">
      <div class="export-card">
        <h3 class="export-title">Export Data</h3>
        <div class="export-actions">
          <button
            type="button"
            class="export-btn csv"
            [disabled]="exporting()"
            (click)="exportCSV()"
          >
            <span class="export-icon">📊</span>
            {{ exporting() ? 'Sharing...' : 'Export CSV' }}
          </button>
          <button
            type="button"
            class="export-btn pdf"
            [disabled]="exporting()"
            (click)="exportReport()"
          >
            <span class="export-icon">📄</span>
            {{ exporting() ? 'Sharing...' : 'Export Report' }}
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrl: './export-data.scss',
})
export class ExportData {
  readonly cycle = input.required<CycleData>();
  protected readonly exporting = signal(false);

  protected async exportCSV(): Promise<void> {
    this.exporting.set(true);
    try {
      const csv = this.buildCSV();
      const filename = `expenses-${this.cycle().label}.csv`;
      // BOM prefix so Excel correctly reads UTF-8
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });

      if (this.isNativeApp()) {
        await this.shareFile(blob, filename);
      } else {
        this.downloadBlob(blob, filename);
      }
    } finally {
      this.exporting.set(false);
    }
  }

  protected async exportReport(): Promise<void> {
    this.exporting.set(true);
    try {
      const html = this.buildReportHTML();

      if (this.isNativeApp()) {
        // Android: share as HTML file → user can open, print, or save as PDF
        const filename = `expenses-${this.cycle().label}.html`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        await this.shareFile(blob, filename);
      } else {
        // Desktop: iframe print (triggers browser print / save-as-PDF dialog)
        this.printViaIframe(html);
      }
    } finally {
      this.exporting.set(false);
    }
  }

  // ── Helpers ──

  /** Capacitor injects window.Capacitor at runtime in the Android WebView */
  private isNativeApp(): boolean {
    return 'Capacitor' in window;
  }

  /** Share a file via Android's native share sheet */
  private async shareFile(blob: Blob, filename: string): Promise<void> {
    const file = new File([blob], filename, { type: blob.type });
    try {
      await navigator.share({
        files: [file],
        title: `Expenzo – ${this.cycle().label}`,
      });
    } catch (e) {
      // AbortError = user cancelled share → ignore
      if (e instanceof DOMException && e.name === 'AbortError') return;
      // Share not supported or failed → fall back to blob download
      this.downloadBlob(blob, filename);
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
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
    }, 200);
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
      // Clean up after print dialog closes
      const cleanup = () => {
        try {
          document.body.removeChild(iframe);
        } catch {
          /* already removed */
        }
      };
      iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true });
      // Fallback if afterprint never fires (e.g. dialog cancelled quickly)
      setTimeout(cleanup, 10_000);
    }, 400);
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

  private esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
