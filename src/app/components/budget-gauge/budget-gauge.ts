import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';

import { CycleData } from '../../models/expense.model';

@Component({
  selector: 'app-budget-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, PercentPipe],
  template: `
    <section class="gauge-section">
      <div class="gauge-card">
        <div class="gauge-header">
          <span class="gauge-label">Budget Used</span>
          <span class="gauge-percent" [class.danger]="utilization() > 100">{{
            utilization() / 100 | percent: '1.0-0'
          }}</span>
        </div>
        <div class="gauge-bar-wrap">
          <div
            class="gauge-bar-fill"
            [style.width.%]="Math.min(utilization(), 100)"
            [class.warning]="utilization() > 75 && utilization() <= 100"
            [class.danger]="utilization() > 100"
          ></div>
        </div>
        <div class="gauge-footer">
          <span>{{
            cycle().summary.totalExpense | currency: 'INR' : 'symbol-narrow' : '1.0-0'
          }}</span>
          <span>{{ totalBudget() | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}</span>
        </div>
      </div>
    </section>
  `,
  styleUrl: './budget-gauge.scss',
})
export class BudgetGauge {
  readonly cycle = input.required<CycleData>();

  protected readonly Math = Math;

  protected readonly totalBudget = computed(() =>
    this.cycle().categorySummary.reduce((sum, c) => sum + c.limit, 0),
  );

  protected readonly utilization = computed(() => {
    const budget = this.totalBudget();
    if (budget === 0) return 0;
    return Math.round((this.cycle().summary.totalExpense / budget) * 100);
  });
}
