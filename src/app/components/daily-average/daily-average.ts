import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { CycleData } from '../../models/expense.model';

@Component({
  selector: 'app-daily-average',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <section class="daily-avg-section">
      <div class="daily-avg-card">
        <div class="daily-avg-header">
          <span class="daily-avg-label">Daily Average</span>
          <span class="daily-avg-value">{{
            dailyAvg() | currency: 'INR' : 'symbol-narrow' : '1.0-0'
          }}</span>
        </div>
        <div class="daily-avg-details">
          <div class="avg-row">
            <span class="avg-key">Ideal pace</span>
            <span class="avg-val ideal">{{
              idealDailySpend() | currency: 'INR' : 'symbol-narrow' : '1.0-0'
            }}</span>
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
    const diff = c.cycleTo.getTime() - c.cycleFrom.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  });

  protected readonly daysElapsed = computed(() => {
    const c = this.cycle();
    const now = new Date();
    const elapsed = now.getTime() - c.cycleFrom.getTime();
    const days = Math.ceil(elapsed / (1000 * 60 * 60 * 24));
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
}
