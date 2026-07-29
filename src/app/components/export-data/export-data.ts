import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { CycleData, Transaction } from '../../models/expense.model';
import { FileExportService } from '../../services/file-export.service';
import { formatIndiaDate } from '../../utils/transaction-date';

@Component({
  selector: 'app-export-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    <section class="export-section">
      <div class="export-card">
        <h3 class="export-title">Export Data</h3>
        <div class="export-actions">
          <button type="button" class="export-btn csv" [disabled]="busy()" (click)="onExportCSV()">
            <svg class="export-icon" lucideIcon="file-spreadsheet" aria-hidden="true"></svg>
            Export CSV
          </button>
          <button
            type="button"
            class="export-btn pdf"
            [disabled]="busy()"
            (click)="onExportReport()"
          >
            <svg class="export-icon" lucideIcon="file-text" aria-hidden="true"></svg>
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
  private readonly fileExport = inject(FileExportService);

  readonly cycle = input.required<CycleData>();

  protected readonly busy = signal(false);
  protected readonly toast = signal('');
  protected readonly toastError = signal(false);

  protected onExportCSV(): void {
    this.busy.set(true);
    this.clearToast();

    this.fileExport
      .exportCsv({
        filename: `expenses-${this.cycle().label}.csv`,
        content: this.buildCSV(),
        title: `Expenzo CSV - ${this.cycle().label}`,
      })
      .then((message) => this.showToast(message))
      .catch(() => this.showToast('Export failed', true))
      .finally(() => this.busy.set(false));
  }

  protected onExportReport(): void {
    this.busy.set(true);
    this.clearToast();

    this.fileExport
      .exportPdf({
        filename: `expenzo-report-${this.cycle().label}.pdf`,
        androidPayload: this.buildAndroidReportPayload(),
        fallbackHtml: this.buildReportHTML(),
        title: `Expenzo Report - ${this.cycle().label}`,
      })
      .then((message) => this.showToast(message))
      .catch(() => this.showToast('Export failed', true))
      .finally(() => this.busy.set(false));
  }

  private showToast(message: string, isError = false): void {
    this.toast.set(message);
    this.toastError.set(isError);
    window.setTimeout(() => this.clearToast(), 3500);
  }

  private clearToast(): void {
    this.toast.set('');
    this.toastError.set(false);
  }

  private buildCSV(): string {
    const header = 'Date,Name,Category,Amount\n';
    const rows = this.cycle()
      .transactions.map((transaction: Transaction) => {
        const date = this.formatDate(transaction.date);
        return [
          this.csvCell(date),
          this.csvCell(transaction.name),
          this.csvCell(transaction.category),
          transaction.price,
        ].join(',');
      })
      .join('\n');
    return header + rows;
  }

  private buildReportHTML(): string {
    const cycle = this.cycle();
    let html = `<!doctype html><html><head><meta charset="utf-8">`;
    html += `<title>Expenzo - ${this.escapeHtml(cycle.label)}</title>`;
    html += `<style>
      @page{size:A4;margin:14mm}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:system-ui,sans-serif;padding:20px;font-size:12px;color:#222}
      h1{color:#2e7d32;font-size:18px}h2{font-size:14px;margin-top:20px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
      th{background:#f5f5f5;font-weight:600}.summary{display:flex;gap:20px;flex-wrap:wrap}
    </style></head><body>`;
    html += `<h1>Expense Report - ${this.escapeHtml(cycle.label)}</h1>`;
    html += `<div class="summary">`;
    html += `<span><strong>Income:</strong> ${this.formatCurrency(cycle.summary.totalIncome)}</span>`;
    html += `<span><strong>Expense:</strong> ${this.formatCurrency(cycle.summary.totalExpense)}</span>`;
    html += `<span><strong>Savings:</strong> ${this.formatCurrency(cycle.summary.savings)}</span>`;
    html += `</div>`;
    html += `<h2>Category Breakdown</h2>`;
    html += `<table><thead><tr><th>Category</th><th>Spent</th><th>Budget</th></tr></thead><tbody>`;
    for (const category of cycle.categorySummary) {
      html += `<tr><td>${this.escapeHtml(category.category)}</td>`;
      html += `<td>${this.formatCurrency(category.spent)}</td>`;
      html += `<td>${this.formatCurrency(category.limit)}</td></tr>`;
    }
    html += `</tbody></table>`;
    html += `<h2>Transactions</h2>`;
    html += `<table><thead><tr><th>Date</th><th>Name</th><th>Category</th><th>Amount</th></tr></thead><tbody>`;
    for (const transaction of cycle.transactions) {
      html += `<tr><td>${this.escapeHtml(this.formatDate(transaction.date))}</td>`;
      html += `<td>${this.escapeHtml(transaction.name)}</td>`;
      html += `<td>${this.escapeHtml(transaction.category)}</td>`;
      html += `<td>${this.formatCurrency(transaction.price)}</td></tr>`;
    }
    html += `</tbody></table></body></html>`;
    return html;
  }

  private buildAndroidReportPayload(): string {
    const cycle = this.cycle();
    return JSON.stringify({
      title: `Expenzo Report - ${cycle.label}`,
      summary: [
        { label: 'Income', value: this.formatCurrency(cycle.summary.totalIncome) },
        { label: 'Expense', value: this.formatCurrency(cycle.summary.totalExpense) },
        { label: 'Savings', value: this.formatCurrency(cycle.summary.savings) },
      ],
      categories: cycle.categorySummary.map((category) => ({
        category: category.category,
        spent: this.formatCurrency(category.spent),
        budget: this.formatCurrency(category.limit),
      })),
      transactions: cycle.transactions.map((transaction) => ({
        date: this.formatDate(transaction.date),
        name: transaction.name,
        category: transaction.category,
        amount: this.formatCurrency(transaction.price),
      })),
    });
  }

  private formatDate(value: string): string {
    return formatIndiaDate(value, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatCurrency(value: number): string {
    return `INR ${value.toLocaleString('en-IN')}`;
  }

  private csvCell(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
