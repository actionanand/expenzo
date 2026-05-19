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
            {{ exporting() ? 'Saving...' : 'Export CSV' }}
          </button>
          <button type="button" class="export-btn pdf" (click)="exportPDF()">
            <span class="export-icon">📄</span>
            Print / PDF
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

  protected exportCSV(): void {
    const txs = this.cycle().transactions;
    const header = 'Date,Name,Category,Amount\n';
    const rows = txs
      .map((tx: Transaction) => {
        const date = new Date(tx.date).toLocaleDateString('en-IN');
        const name = `"${tx.name.replace(/"/g, '""')}"`;
        return `${date},${name},${tx.category},${tx.price}`;
      })
      .join('\n');
    const csv = header + rows;
    const filename = `expenses-${this.cycle().label}.csv`;
    const blob = new Blob([csv], { type: 'text/csv' });

    // Try Web Share API (works in Android WebView / Capacitor)
    if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename)] })) {
      this.exporting.set(true);
      const file = new File([blob], filename, { type: 'text/csv' });
      navigator
        .share({ files: [file], title: `Expenses - ${this.cycle().label}` })
        .catch(() => {
          // User cancelled share — fallback to download
          this.downloadBlob(blob, filename);
        })
        .finally(() => this.exporting.set(false));
    } else {
      this.downloadBlob(blob, filename);
    }
  }

  protected exportPDF(): void {
    const cycle = this.cycle();
    const txs = cycle.transactions;

    let html = `<html><head><title>Expenzo - ${cycle.label}</title>`;
    html += `<style>
      body { font-family: system-ui, sans-serif; padding: 20px; font-size: 12px; }
      h1 { color: #2e7d32; font-size: 18px; }
      h2 { font-size: 14px; margin-top: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      .summary { margin: 10px 0; }
      .summary span { margin-right: 20px; }
      @media print { .no-print { display: none; } }
    </style></head><body>`;
    html += `<h1>Expense Report - ${cycle.label}</h1>`;
    html += `<div class="summary">`;
    html += `<span><strong>Income:</strong> ₹${cycle.summary.totalIncome.toLocaleString('en-IN')}</span>`;
    html += `<span><strong>Expense:</strong> ₹${cycle.summary.totalExpense.toLocaleString('en-IN')}</span>`;
    html += `<span><strong>Savings:</strong> ₹${cycle.summary.savings.toLocaleString('en-IN')}</span>`;
    html += `</div>`;

    html += `<h2>Category Breakdown</h2><table><tr><th>Category</th><th>Spent</th><th>Budget</th></tr>`;
    for (const cat of cycle.categorySummary) {
      html += `<tr><td>${cat.category}</td><td>₹${cat.spent.toLocaleString('en-IN')}</td><td>₹${cat.limit.toLocaleString('en-IN')}</td></tr>`;
    }
    html += `</table>`;

    html += `<h2>Transactions</h2><table><tr><th>Date</th><th>Name</th><th>Category</th><th>Amount</th></tr>`;
    for (const tx of txs) {
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      html += `<tr><td>${this.escapeHtml(date)}</td><td>${this.escapeHtml(tx.name)}</td><td>${this.escapeHtml(tx.category)}</td><td>₹${tx.price.toLocaleString('en-IN')}</td></tr>`;
    }
    html += `</table></body></html>`;

    this.printViaNewDocument(html);
  }

  private printViaNewDocument(html: string): void {
    // Write HTML into the current document for printing (works in Capacitor WebView)
    const originalContent = document.body.innerHTML;
    const originalTitle = document.title;

    document.body.innerHTML = html;
    document.title = 'Expenzo Report';

    // Wait for render, then trigger print
    setTimeout(() => {
      window.print();
      // Restore after print dialog
      setTimeout(() => {
        document.body.innerHTML = originalContent;
        document.title = originalTitle;
        // Force Angular to reattach — navigate to same route
        window.location.reload();
      }, 500);
    }, 200);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
