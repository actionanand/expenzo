import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

import { CycleData } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';
import { todayInIndia } from '../../utils/transaction-date';

@Component({
  selector: 'app-daily-average',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="daily-avg-section">
      <div class="daily-avg-card">
        <div class="daily-avg-header">
          <span class="daily-avg-label">Daily Average</span>
          <span class="daily-avg-value">{{ dailyAvg() | money }}</span>
        </div>
        <div class="daily-avg-details">
          <div class="avg-row">
            <span class="avg-key">Ideal pace</span>
            <span class="avg-val ideal">{{ idealDailySpend() | money }}</span>
          </div>
          <div class="avg-row">
            <span class="avg-key">Days elapsed</span>
            <span class="avg-val">{{ daysElapsed() }} / {{ totalDays() }}</span>
          </div>
          <div class="avg-row">
            <span class="avg-key">Status</span>
            <span class="avg-val" [class.on-pace]="isOnPace()" [class.over-pace]="!isOnPace()">
              {{ isOnPace() ? 'On track' : 'Overspending' }}
            </span>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './daily-average.scss',
})
export class DailyAverage {
  readonly cycle = input.required<CycleData>();

  protected readonly totalDays = computed(() => {
    const c = this.cycle();
    return this.dayDifference(c.cycleFrom, c.cycleTo) + 1;
  });

  protected readonly daysElapsed = computed(() => {
    const c = this.cycle();
    const now = todayInIndia();
    const days = this.dayDifference(c.cycleFrom, now) + 1;
    return Math.max(Math.min(days, this.totalDays()), 1);
  });

  protected readonly dailyAvg = computed(() => {
    const elapsed = this.daysElapsed();
    return elapsed > 0 ? Math.round(this.cycle().summary.totalExpense / elapsed) : 0;
  });

  protected readonly idealDailySpend = computed(() => {
    const budget = this.cycle().summary.totalIncome;
    return Math.round(budget / this.totalDays());
  });

  protected readonly isOnPace = computed(() => this.dailyAvg() <= this.idealDailySpend());

  private dayDifference(from: Date, to: Date): number {
    const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.max(0, Math.round((toUtc - fromUtc) / 86_400_000));
  }
}
