import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

import { CycleData } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';

interface CategoryTrendItem {
  category: string;
  months: { month: string; spent: number }[];
  total: number;
  avg: number;
}

@Component({
  selector: 'app-category-trend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="trend-section">
      <h2 class="section-title">Category-wise Spending</h2>
      <div class="trend-list">
        @for (trend of trends(); track trend.category) {
          <details class="trend-card">
            <summary class="trend-header">
              <span class="trend-name">{{ trend.category }}</span>
              <span class="trend-stats">
                <span class="trend-total">{{ trend.total | money }}</span>
                <span class="trend-avg">avg {{ trend.avg | money }}/mo</span>
              </span>
            </summary>
            <div class="trend-months">
              @for (m of trend.months; track m.month) {
                <div class="trend-month-row">
                  <span class="trend-month-name">{{ m.month }}</span>
                  <div class="trend-bar-wrap">
                    <div class="trend-bar" [style.width.%]="getBarWidth(m.spent, trend)"></div>
                  </div>
                  <span class="trend-month-amount">{{ m.spent | money }}</span>
                </div>
              }
            </div>
          </details>
        }
      </div>
    </section>
  `,
  styleUrl: './category-trend.scss',
})
export class CategoryTrend {
  readonly allMonths = input.required<CycleData[]>();

  protected readonly trends = computed<CategoryTrendItem[]>(() => {
    const months = this.allMonths();
    const categoryMap = new Map<string, { month: string; spent: number }[]>();

    for (const m of months) {
      for (const cs of m.categorySummary) {
        if (!categoryMap.has(cs.category)) {
          categoryMap.set(cs.category, []);
        }
        categoryMap.get(cs.category)!.push({ month: m.label, spent: cs.spent });
      }
    }

    return Array.from(categoryMap.entries())
      .map(([category, monthData]): CategoryTrendItem => {
        const total = monthData.reduce((sum, d) => sum + d.spent, 0);
        return {
          category,
          months: monthData,
          total,
          avg: Math.round(total / monthData.length),
        };
      })
      .sort((a, b) => b.total - a.total);
  });

  protected getBarWidth(spent: number, trend: CategoryTrendItem): number {
    const max = Math.max(...trend.months.map((m) => m.spent));
    if (max === 0) return 0;
    return (spent / max) * 100;
  }
}
