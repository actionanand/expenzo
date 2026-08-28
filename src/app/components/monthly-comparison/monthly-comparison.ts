import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { PercentPipe } from '@angular/common';

import { CycleData } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';

interface ComparisonRow {
  month: string;
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}

@Component({
  selector: 'app-monthly-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe, PercentPipe],
  template: `
    <section class="comparison-section">
      <h2 class="section-title">
        {{ title() }}
        <span class="comparison-count">({{ rows().length }} months)</span>
      </h2>
      <div class="comparison-table-wrap">
        <table class="comparison-table" aria-label="Monthly comparison">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Expense</th>
              <th>Savings</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.month) {
              <tr>
                <td class="month-cell">{{ row.month }}</td>
                <td class="amount-cell income">
                  {{ row.income | money }}
                </td>
                <td class="amount-cell expense">
                  {{ row.expense | money }}
                </td>
                <td
                  class="amount-cell"
                  [class.positive]="row.savings >= 0"
                  [class.negative]="row.savings < 0"
                >
                  {{ row.savings | money }}
                </td>
                <td
                  class="rate-cell"
                  [class.positive]="row.savingsRate >= 0"
                  [class.negative]="row.savingsRate < 0"
                >
                  {{ row.savingsRate | percent: '1.0-0' }}
                </td>
              </tr>
            }
          </tbody>
          @if (rows().length > 1) {
            <tfoot>
              <tr>
                <td class="month-cell"><strong>Total</strong></td>
                <td class="amount-cell income">
                  {{ totalIncome() | money }}
                </td>
                <td class="amount-cell expense">
                  {{ totalExpense() | money }}
                </td>
                <td
                  class="amount-cell"
                  [class.positive]="totalSavings() >= 0"
                  [class.negative]="totalSavings() < 0"
                >
                  {{ totalSavings() | money }}
                </td>
                <td
                  class="rate-cell"
                  [class.positive]="avgRate() >= 0"
                  [class.negative]="avgRate() < 0"
                >
                  {{ avgRate() | percent: '1.0-0' }}
                </td>
              </tr>
            </tfoot>
          }
        </table>
      </div>
    </section>
  `,
  styleUrl: './monthly-comparison.scss',
})
export class MonthlyComparison {
  readonly months = input.required<CycleData[]>();
  readonly title = input('Monthly Comparison');

  protected readonly rows = computed<ComparisonRow[]>(() =>
    this.months().map((m) => ({
      month: m.label,
      income: m.summary.totalIncome,
      expense: m.summary.totalExpense,
      savings: m.summary.savings - m.summary.shortage,
      savingsRate:
        m.summary.totalIncome > 0
          ? (m.summary.savings - m.summary.shortage) / m.summary.totalIncome
          : 0,
    })),
  );

  protected readonly totalIncome = computed(() => this.rows().reduce((s, r) => s + r.income, 0));
  protected readonly totalExpense = computed(() => this.rows().reduce((s, r) => s + r.expense, 0));
  protected readonly totalSavings = computed(() => this.rows().reduce((s, r) => s + r.savings, 0));
  protected readonly avgRate = computed(() => {
    const ti = this.totalIncome();
    return ti > 0 ? this.totalSavings() / ti : 0;
  });
}
