import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { CycleData } from '../../models/expense.model';

const DAY_MS = 86_400_000;

@Component({
  selector: 'app-budget-cycle-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    <header class="cycle-heading">
      <p>Current budget cycle</p>
      <h1>Good {{ daysRemaining() > 15 ? 'start' : 'progress' }}</h1>
      <span>Here is how your money is doing today.</span>
    </header>
    <section class="budget-hero" aria-labelledby="available-budget-title">
      <div class="hero-top">
        <div class="amount-copy">
          <p id="available-budget-title">Available to spend</p>
          <strong>{{ formatCurrency(availableToSpend()) }}</strong>
          <span>of {{ formatCurrency(totalBudget()) }} budget</span>
        </div>
        <div
          class="progress-ring"
          role="progressbar"
          aria-label="Budget used"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="clampedPercent()"
          [style.--progress-degrees]="progressDegrees()"
        >
          <span>{{ usedPercent() }}%</span>
          <small>used</small>
        </div>
      </div>

      <div class="progress-track" aria-hidden="true">
        <span [style.width.%]="clampedPercent()"></span>
      </div>

      <div class="hero-metrics">
        <span>
          <svg lucideIcon="calendar-days" aria-hidden="true"></svg>
          <strong>{{ daysRemaining() }}</strong>
          <small>days left</small>
        </span>
        <span>
          <svg lucideIcon="gauge" aria-hidden="true"></svg>
          <strong>{{ formatCurrency(dailyAverage()) }}</strong>
          <small>per day</small>
        </span>
        <span>
          <svg lucideIcon="trending-up" aria-hidden="true"></svg>
          <strong>{{ formatCurrency(projectedExpense()) }}</strong>
          <small>projected</small>
        </span>
      </div>
    </section>
  `,
  styleUrl: './budget-cycle-hero.scss',
})
export class BudgetCycleHero {
  readonly cycle = input.required<CycleData>();

  protected readonly totalBudget = computed(() =>
    this.cycle().categorySummary.reduce((total, category) => total + category.limit, 0),
  );
  protected readonly availableToSpend = computed(
    () => this.totalBudget() - this.cycle().summary.totalExpense,
  );
  protected readonly usedPercent = computed(() => {
    const budget = this.totalBudget();
    return budget > 0 ? Math.round((this.cycle().summary.totalExpense / budget) * 100) : 0;
  });
  protected readonly clampedPercent = computed(() =>
    Math.min(100, Math.max(0, this.usedPercent())),
  );
  protected readonly progressDegrees = computed(() => `${this.clampedPercent() * 3.6}deg`);
  protected readonly cycleDays = computed(
    () => this.dayDifference(this.cycle().cycleFrom, this.cycle().cycleTo) + 1,
  );
  protected readonly daysElapsed = computed(() => {
    const start = this.atStartOfDay(this.cycle().cycleFrom);
    const end = this.atStartOfDay(this.cycle().cycleTo);
    const today = this.atStartOfDay(new Date());
    if (today < start) {
      return 1;
    }
    if (today > end) {
      return this.cycleDays();
    }
    return this.dayDifference(start, today) + 1;
  });
  protected readonly daysRemaining = computed(() => {
    const start = this.atStartOfDay(this.cycle().cycleFrom);
    const end = this.atStartOfDay(this.cycle().cycleTo);
    const today = this.atStartOfDay(new Date());
    if (today < start) {
      return this.cycleDays();
    }
    if (today > end) {
      return 0;
    }
    return this.dayDifference(today, end) + 1;
  });
  protected readonly dailyAverage = computed(() =>
    Math.round(this.cycle().summary.totalExpense / Math.max(1, this.daysElapsed())),
  );
  protected readonly projectedExpense = computed(() =>
    Math.round(this.dailyAverage() * this.cycleDays()),
  );

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private atStartOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private dayDifference(from: Date, to: Date): number {
    const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.max(0, Math.round((toUtc - fromUtc) / DAY_MS));
  }
}
