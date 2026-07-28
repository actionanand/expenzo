import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { AppSelectOption, AppSelectPicker } from '../app-select-picker/app-select-picker';
import { CycleData, Transaction } from '../../models/expense.model';
import { FileExportService } from '../../services/file-export.service';

type ExportScope = 'current' | 'range' | 'all';

interface ScopedTransaction {
  readonly cycle: CycleData;
  readonly transaction: Transaction;
}

interface ExportCategory {
  readonly category: string;
  readonly spent: number;
  readonly budget: number;
}

@Component({
  selector: 'app-transaction-export',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppSelectPicker, LucideDynamicIcon],
  template: `
    <section class="transaction-export" aria-labelledby="transaction-export-title">
      <button
        class="export-toggle"
        type="button"
        [attr.aria-expanded]="expanded()"
        aria-controls="transaction-export-content"
        (click)="toggleExpanded()"
      >
        <span class="export-icon" aria-hidden="true">
          <svg lucideIcon="file-text"></svg>
        </span>
        <span class="export-heading">
          <span class="export-title" id="transaction-export-title">Save or share</span>
          <span class="export-description">Export transactions</span>
        </span>
        <span class="record-count">{{ scopedTransactions().length }} records</span>
        <span class="export-chevron" [class.expanded]="expanded()" aria-hidden="true">
          <svg lucideIcon="chevron-down"></svg>
        </span>
      </button>

      @if (expanded()) {
        <div class="export-content" id="transaction-export-content">
          <div class="scope-controls">
            <app-select-picker
              label="Export period"
              sheetTitle="Choose export period"
              [options]="scopeOptions"
              [value]="scope()"
              (valueChange)="onScopeChange($event)"
            />

            @if (scope() === 'range') {
              <div class="range-controls">
                <app-select-picker
                  label="From cycle"
                  sheetTitle="Start cycle"
                  [options]="cycleOptions()"
                  [value]="fromCycleValue()"
                  (valueChange)="onFromCycleChange($event)"
                />
                <app-select-picker
                  label="To cycle"
                  sheetTitle="End cycle"
                  [options]="cycleOptions()"
                  [value]="toCycleValue()"
                  (valueChange)="onToCycleChange($event)"
                />
              </div>
            }
          </div>

          <div class="export-summary">
            <span>{{ scopeDescription() }}</span>
            <strong>{{ formatCurrency(exportTotal()) }} total</strong>
          </div>

          @if (filterDescription()) {
            <p class="filter-note">{{ filterDescription() }}</p>
          }

          <div class="export-actions">
            <button
              type="button"
              [disabled]="busy() || scopedTransactions().length === 0"
              (click)="exportCsv()"
            >
              <svg lucideIcon="file-spreadsheet" aria-hidden="true"></svg>
              Export CSV
            </button>
            <button
              type="button"
              [disabled]="busy() || scopedTransactions().length === 0"
              (click)="exportPdf()"
            >
              <svg lucideIcon="file-text" aria-hidden="true"></svg>
              Export PDF
            </button>
          </div>

          @if (toast()) {
            <p class="export-toast" [class.error]="toastError()" role="status">{{ toast() }}</p>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './transaction-export.scss',
})
export class TransactionExport {
  private readonly fileExport = inject(FileExportService);

  readonly cycles = input.required<readonly CycleData[]>();
  readonly category = input('all');
  readonly search = input('');

  protected readonly expanded = signal(false);
  protected readonly scope = signal<ExportScope>('current');
  protected readonly selectedFromCycle = signal('');
  protected readonly selectedToCycle = signal('');
  protected readonly busy = signal(false);
  protected readonly toast = signal('');
  protected readonly toastError = signal(false);
  protected readonly scopeOptions: readonly AppSelectOption[] = [
    {
      value: 'current',
      label: 'Current cycle',
      detail: 'Export the cycle containing today',
    },
    {
      value: 'range',
      label: 'Range of cycles',
      detail: 'Choose a start and end cycle',
    },
    {
      value: 'all',
      label: 'All cycles',
      detail: 'Export the complete transaction history',
    },
  ];
  protected readonly cycleOptions = computed<readonly AppSelectOption[]>(() =>
    this.cycles().map((cycle) => ({
      value: this.cycleKey(cycle),
      label: this.formatCycleRange(cycle),
      detail: `${cycle.transactions.length} transactions`,
    })),
  );
  protected readonly currentCycle = computed(() => {
    const cycles = this.cycles();
    const today = this.atStartOfDay(new Date());
    return (
      cycles.find(
        (cycle) =>
          today >= this.atStartOfDay(cycle.cycleFrom) && today <= this.atStartOfDay(cycle.cycleTo),
      ) ?? cycles.at(-1)
    );
  });
  protected readonly fromCycleValue = computed(
    () =>
      this.validCycleKey(this.selectedFromCycle()) ??
      this.cycleKey(this.cycles().at(-2) ?? this.cycles().at(-1)),
  );
  protected readonly toCycleValue = computed(
    () => this.validCycleKey(this.selectedToCycle()) ?? this.cycleKey(this.cycles().at(-1)),
  );
  protected readonly selectedCycles = computed<readonly CycleData[]>(() => {
    const cycles = this.cycles();
    if (cycles.length === 0) {
      return [];
    }
    if (this.scope() === 'current') {
      const current = this.currentCycle();
      return current ? [current] : [];
    }
    if (this.scope() === 'all') {
      return cycles;
    }

    const fromIndex = cycles.findIndex((cycle) => this.cycleKey(cycle) === this.fromCycleValue());
    const toIndex = cycles.findIndex((cycle) => this.cycleKey(cycle) === this.toCycleValue());
    const start = Math.max(0, Math.min(fromIndex, toIndex));
    const end = Math.max(fromIndex, toIndex);
    return cycles.slice(start, end + 1);
  });
  protected readonly scopedTransactions = computed<readonly ScopedTransaction[]>(() => {
    const category = this.normalizeCategory(this.category());
    const search = this.search().trim().toLocaleLowerCase();

    return this.selectedCycles()
      .flatMap((cycle) =>
        cycle.transactions
          .filter((transaction) => {
            const categoryMatches =
              category === 'all' || this.normalizeCategory(transaction.category) === category;
            const searchMatches =
              search.length === 0 || transaction.name.toLocaleLowerCase().includes(search);
            return categoryMatches && searchMatches;
          })
          .map((transaction) => ({ cycle, transaction })),
      )
      .sort(
        (left, right) =>
          this.transactionTimestamp(right.transaction.date) -
          this.transactionTimestamp(left.transaction.date),
      );
  });
  protected readonly exportTotal = computed(() =>
    this.scopedTransactions().reduce((total, item) => total + item.transaction.price, 0),
  );
  protected readonly scopeDescription = computed(() => {
    const cycles = this.selectedCycles();
    if (cycles.length === 0) {
      return 'No cycles available';
    }
    if (cycles.length === 1) {
      return this.formatCycleRange(cycles[0]);
    }
    return `${this.formatShortDate(cycles[0].cycleFrom)} — ${this.formatShortDate(
      cycles[cycles.length - 1].cycleTo,
    )} (${cycles.length} cycles)`;
  });
  protected readonly filterDescription = computed(() => {
    const filters: string[] = [];
    if (this.category() !== 'all') {
      filters.push(`Category: ${this.capitalizeCategory(this.category())}`);
    }
    if (this.search().trim()) {
      filters.push(`Search: “${this.search().trim()}”`);
    }
    return filters.length > 0 ? `Current filters applied — ${filters.join(', ')}` : '';
  });

  protected onScopeChange(value: string): void {
    if (value === 'current' || value === 'range' || value === 'all') {
      this.scope.set(value);
    }
  }

  protected toggleExpanded(): void {
    this.expanded.update((isExpanded) => !isExpanded);
  }

  protected onFromCycleChange(value: string): void {
    this.selectedFromCycle.set(value);
    if (this.cycleIndex(value) > this.cycleIndex(this.toCycleValue())) {
      this.selectedToCycle.set(value);
    }
  }

  protected onToCycleChange(value: string): void {
    this.selectedToCycle.set(value);
    if (this.cycleIndex(value) < this.cycleIndex(this.fromCycleValue())) {
      this.selectedFromCycle.set(value);
    }
  }

  protected exportCsv(): void {
    this.runExport(() =>
      this.fileExport.exportCsv({
        filename: `expenzo-transactions-${this.fileScope()}.csv`,
        content: this.buildCsv(),
        title: `Expenzo Transactions - ${this.scopeDescription()}`,
      }),
    );
  }

  protected exportPdf(): void {
    this.runExport(() =>
      this.fileExport.exportPdf({
        filename: `expenzo-transactions-${this.fileScope()}.pdf`,
        androidPayload: this.buildAndroidPayload(),
        fallbackHtml: this.buildReportHtml(),
        title: `Expenzo Transactions - ${this.scopeDescription()}`,
      }),
    );
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private runExport(operation: () => Promise<string>): void {
    this.busy.set(true);
    this.clearToast();
    operation()
      .then((message) => this.showToast(message))
      .catch(() => this.showToast('Export failed', true))
      .finally(() => this.busy.set(false));
  }

  private buildCsv(): string {
    const header = 'Cycle,Date,Name,Category,Amount\n';
    const rows = this.scopedTransactions()
      .map(({ cycle, transaction }) =>
        [
          this.csvCell(this.formatCycleRange(cycle)),
          this.csvCell(this.formatTransactionDate(transaction.date)),
          this.csvCell(transaction.name),
          this.csvCell(this.capitalizeCategory(this.normalizeCategory(transaction.category))),
          transaction.price,
        ].join(','),
      )
      .join('\n');
    return header + rows;
  }

  private buildAndroidPayload(): string {
    const transactions = this.scopedTransactions();
    return JSON.stringify({
      title: `Expenzo Transactions - ${this.scopeDescription()}`,
      summary: [
        { label: 'Period', value: this.scopeDescription() },
        { label: 'Transactions', value: transactions.length.toLocaleString('en-IN') },
        { label: 'Total spent', value: this.formatPdfCurrency(this.exportTotal()) },
        {
          label: 'Average',
          value: this.formatPdfCurrency(
            transactions.length > 0 ? this.exportTotal() / transactions.length : 0,
          ),
        },
      ],
      categories: this.exportCategories().map((category) => ({
        category: category.category,
        spent: this.formatPdfCurrency(category.spent),
        budget: this.formatPdfCurrency(category.budget),
      })),
      transactions: transactions.map(({ transaction }) => ({
        date: this.formatTransactionDate(transaction.date),
        name: transaction.name,
        category: this.capitalizeCategory(this.normalizeCategory(transaction.category)),
        amount: this.formatPdfCurrency(transaction.price),
      })),
    });
  }

  private buildReportHtml(): string {
    const transactions = this.scopedTransactions();
    let html = `<!doctype html><html><head><meta charset="utf-8">`;
    html += `<title>Expenzo Transactions</title><style>
      @page{size:A4;margin:14mm}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:system-ui,sans-serif;padding:20px;font-size:11px;color:#222}
      h1{color:#2e7d32;font-size:18px}h2{font-size:14px;margin-top:20px}
      .summary{display:flex;gap:18px;flex-wrap:wrap;margin:10px 0}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}
      th{background:#f5f5f5;font-weight:600}
    </style></head><body>`;
    html += `<h1>Expenzo Transactions</h1>`;
    html += `<p>${this.escapeHtml(this.scopeDescription())}</p>`;
    html += `<div class="summary"><span><strong>Transactions:</strong> ${transactions.length}</span>`;
    html += `<span><strong>Total:</strong> ${this.formatCurrency(this.exportTotal())}</span></div>`;
    html += `<h2>Category Breakdown</h2>`;
    html += `<table><thead><tr><th>Category</th><th>Spent</th><th>Budget</th></tr></thead><tbody>`;
    for (const category of this.exportCategories()) {
      html += `<tr><td>${this.escapeHtml(category.category)}</td>`;
      html += `<td>${this.formatCurrency(category.spent)}</td>`;
      html += `<td>${this.formatCurrency(category.budget)}</td></tr>`;
    }
    html += `</tbody></table><h2>Transactions</h2>`;
    html += `<table><thead><tr><th>Date</th><th>Name</th><th>Category</th><th>Amount</th></tr></thead><tbody>`;
    for (const { transaction } of transactions) {
      html += `<tr><td>${this.escapeHtml(this.formatTransactionDate(transaction.date))}</td>`;
      html += `<td>${this.escapeHtml(transaction.name)}</td>`;
      html += `<td>${this.escapeHtml(
        this.capitalizeCategory(this.normalizeCategory(transaction.category)),
      )}</td>`;
      html += `<td>${this.formatCurrency(transaction.price)}</td></tr>`;
    }
    html += `</tbody></table></body></html>`;
    return html;
  }

  private exportCategories(): readonly ExportCategory[] {
    const budgets = new Map<string, number>();
    for (const cycle of this.selectedCycles()) {
      for (const category of cycle.categorySummary) {
        const key = this.normalizeCategory(category.category);
        budgets.set(key, (budgets.get(key) ?? 0) + category.limit);
      }
    }

    const spending = new Map<string, number>();
    for (const { transaction } of this.scopedTransactions()) {
      const key = this.normalizeCategory(transaction.category);
      spending.set(key, (spending.get(key) ?? 0) + transaction.price);
    }

    return [...spending.entries()]
      .map(([key, spent]) => ({
        category: this.capitalizeCategory(key),
        spent,
        budget: budgets.get(key) ?? 0,
      }))
      .sort((left, right) => right.spent - left.spent);
  }

  private fileScope(): string {
    const cycles = this.selectedCycles();
    if (this.scope() === 'all') {
      return 'all-cycles';
    }
    if (cycles.length === 0) {
      return 'empty';
    }
    const from = this.isoDate(cycles[0].cycleFrom);
    const to = this.isoDate(cycles[cycles.length - 1].cycleTo);
    return `${from}-to-${to}`;
  }

  private cycleIndex(key: string): number {
    return this.cycles().findIndex((cycle) => this.cycleKey(cycle) === key);
  }

  private validCycleKey(value: string): string | null {
    return this.cycleIndex(value) >= 0 ? value : null;
  }

  private cycleKey(cycle: CycleData | undefined): string {
    return cycle?.cycleFrom.getTime().toString() ?? '';
  }

  private formatCycleRange(cycle: CycleData): string {
    return `${this.formatShortDate(cycle.cycleFrom)} — ${this.formatShortDate(cycle.cycleTo)}`;
  }

  private formatShortDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatTransactionDate(value: string): string {
    const timestamp = this.transactionTimestamp(value);
    return Number.isFinite(timestamp) ? this.formatShortDate(new Date(timestamp)) : value;
  }

  private transactionTimestamp(value: string): number {
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
    const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value.trim());
    if (!match) {
      return Number.NaN;
    }
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  private normalizeCategory(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase() || 'uncategorized';
  }

  private capitalizeCategory(value: string): string {
    return value.charAt(0).toLocaleUpperCase() + value.slice(1);
  }

  private isoDate(value: Date): string {
    const year = value.getFullYear();
    const month = (value.getMonth() + 1).toString().padStart(2, '0');
    const day = value.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private atStartOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private formatPdfCurrency(value: number): string {
    return `INR ${Math.round(value).toLocaleString('en-IN')}`;
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

  private showToast(message: string, isError = false): void {
    this.toast.set(message);
    this.toastError.set(isError);
    window.setTimeout(() => this.clearToast(), 3500);
  }

  private clearToast(): void {
    this.toast.set('');
    this.toastError.set(false);
  }
}
