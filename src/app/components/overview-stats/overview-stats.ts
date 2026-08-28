import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

import { CycleData } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';

interface OverallStat {
  label: string;
  value: number;
  type: 'income' | 'expense' | 'savings' | 'neutral';
}

@Component({
  selector: 'app-overview-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="overview-section">
      <h2 class="section-title">Overall Statistics</h2>
      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card" [class]="stat.type">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value | money }}</span>
          </div>
        }
      </div>
      @if (topCategories().length > 0) {
        <h3 class="sub-title">Top Spending Categories</h3>
        <div class="top-categories">
          @for (cat of topCategories(); track cat.category; let i = $index) {
            <div class="top-cat-item">
              <span class="top-rank">{{ i + 1 }}</span>
              <span class="top-name">{{ cat.category }}</span>
              <span class="top-amount">{{ cat.total | money }}</span>
            </div>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './overview-stats.scss',
})
export class OverviewStats {
  readonly allMonths = input.required<CycleData[]>();

  protected readonly stats = computed<OverallStat[]>(() => {
    const months = this.allMonths();
    const totalIncome = months.reduce((s, m) => s + m.summary.totalIncome, 0);
    const totalExpense = months.reduce((s, m) => s + m.summary.totalExpense, 0);
    const totalSavings = months.reduce((s, m) => s + m.summary.savings, 0);
    const avgExpense = months.length > 0 ? Math.round(totalExpense / months.length) : 0;
    const avgIncome = months.length > 0 ? Math.round(totalIncome / months.length) : 0;

    return [
      { label: 'Total Income', value: totalIncome, type: 'income' as const },
      { label: 'Total Expense', value: totalExpense, type: 'expense' as const },
      { label: 'Total Savings', value: totalSavings, type: 'savings' as const },
      { label: 'Avg Income/mo', value: avgIncome, type: 'neutral' as const },
      { label: 'Avg Expense/mo', value: avgExpense, type: 'neutral' as const },
      {
        label: 'Avg Savings/mo',
        value: months.length > 0 ? Math.round(totalSavings / months.length) : 0,
        type: 'savings' as const,
      },
    ];
  });

  protected readonly topCategories = computed(() => {
    const months = this.allMonths();
    const catMap = new Map<string, number>();
    for (const m of months) {
      for (const cs of m.categorySummary) {
        catMap.set(cs.category, (catMap.get(cs.category) ?? 0) + cs.spent);
      }
    }
    return Array.from(catMap.entries())
      .map(([category, total]) => ({ category, total }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  });
}
