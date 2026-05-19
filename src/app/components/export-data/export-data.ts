import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { CycleData, Transaction } from '../../models/expense.model';

@Component({
  selector: 'app-export-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="export-section">
      <div class="export-card">
        <h3 class="export-title">Export Data</h3>
        <div class="export-actions">
          <button type="button" class="export-btn csv" (click)="exportCSV()">
            <span class="export-icon">📊</span>
            Export CSV
          </button>
          <button type="button" class="export-btn pdf" (click)="exportPDF()">
            <span class="export-icon">📄</span>
            Export PDF
          </button>
        </div>
      </div>
    </section>
  `,
  styleUrl: './export-data.scss',
})
export class ExportData {
  readonly cycle = input.required<CycleData>();

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
    this.downloadFile(csv, `expenses-${this.cycle().label}.csv`, 'text/csv');
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

    this.printHtml(html);
  }

  private printHtml(html: string): void {
    // Use hidden iframe to avoid opening system browser in Capacitor/Android
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      // Wait for content to render before printing
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after print dialog closes
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
