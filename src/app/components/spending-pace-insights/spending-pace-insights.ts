import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { CycleData } from '../../models/expense.model';

const DAY_MS = 86_400_000;

@Component({
  selector: 'app-spending-pace-insights',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    <section class="pace-insights" aria-labelledby="pace-title">
      <header class="pace-heading">
        <div>
          <p>Spending pace</p>
          <h2 id="pace-title">What you can spend</h2>
        </div>
        <span>{{ daysElapsed() }}/{{ cycleDays() }} days elapsed</span>
      </header>

      <p class="pace-note">
        Income shows maximum cash-flow capacity. Budget shows your planned spending limit.
      </p>

      <div class="pace-grid">
        <article class="pace-card income-pace">
          <header>
            <span class="pace-icon" aria-hidden="true">
              <svg lucideIcon="trending-up"></svg>
            </span>
            <div>
              <h3>Income capacity</h3>
              <p>Based on {{ formatCurrency(totalIncome()) }} income</p>
            </div>
          </header>

          <div class="daily-capacity">
            <strong>{{ formatCurrency(incomePerDay()) }}</strong>
            <span>per day</span>
          </div>

          <dl>
            <div>
              <dt>Capacity through day {{ daysElapsed() }}</dt>
              <dd>{{ formatCurrency(incomeCapacityToDate()) }}</dd>
            </div>
            <div>
              <dt>Actual spent</dt>
              <dd>{{ formatCurrency(actualSpent()) }}</dd>
            </div>
            <div class="pace-result" [class.over]="incomeDifference() < 0">
              <dt>Status</dt>
              <dd>{{ differenceLabel(incomeDifference()) }}</dd>
            </div>
          </dl>
        </article>

        <article class="pace-card budget-pace">
          <header>
            <span class="pace-icon" aria-hidden="true">
              <svg lucideIcon="gauge"></svg>
            </span>
            <div>
              <h3>Budget allowance</h3>
              <p>Based on {{ formatCurrency(totalBudget()) }} category budget</p>
            </div>
          </header>

          <div class="daily-capacity">
            <strong>{{ formatCurrency(budgetPerDay()) }}</strong>
            <span>per day</span>
          </div>

          <dl>
            <div>
              <dt>Allowance through day {{ daysElapsed() }}</dt>
              <dd>{{ formatCurrency(budgetAllowanceToDate()) }}</dd>
            </div>
            <div>
              <dt>Actual spent</dt>
              <dd>{{ formatCurrency(actualSpent()) }}</dd>
            </div>
            <div class="pace-result" [class.over]="budgetDifference() < 0">
              <dt>Status</dt>
              <dd>{{ differenceLabel(budgetDifference()) }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  `,
  styleUrl: './spending-pace-insights.scss',
})
export class SpendingPaceInsights {
  readonly cycle = input.required<CycleData>();

  protected readonly cycleDays = computed(
    () => this.dayDifference(this.cycle().cycleFrom, this.cycle().cycleTo) + 1,
  );
  protected readonly daysElapsed = computed(() => {
    const start = this.atStartOfDay(this.cycle().cycleFrom);
    const end = this.atStartOfDay(this.cycle().cycleTo);
    const today = this.atStartOfDay(new Date());
    if (today < start) {
      return 0;
    }
    if (today > end) {
      return this.cycleDays();
    }
    return this.dayDifference(start, today) + 1;
  });
  protected readonly totalIncome = computed(() => this.cycle().summary.totalIncome);
  protected readonly totalBudget = computed(() =>
    this.cycle().categorySummary.reduce((total, category) => total + category.limit, 0),
  );
  protected readonly actualSpent = computed(() => this.cycle().summary.totalExpense);
  protected readonly incomePerDay = computed(() => this.totalIncome() / this.cycleDays());
  protected readonly budgetPerDay = computed(() => this.totalBudget() / this.cycleDays());
  protected readonly incomeCapacityToDate = computed(
    () => (this.totalIncome() * this.daysElapsed()) / this.cycleDays(),
  );
  protected readonly budgetAllowanceToDate = computed(
    () => (this.totalBudget() * this.daysElapsed()) / this.cycleDays(),
  );
  protected readonly incomeDifference = computed(
    () => this.incomeCapacityToDate() - this.actualSpent(),
  );
  protected readonly budgetDifference = computed(
    () => this.budgetAllowanceToDate() - this.actualSpent(),
  );

  protected differenceLabel(value: number): string {
    const amount = this.formatCurrency(Math.abs(value));
    return value >= 0 ? `${amount} left at this pace` : `${amount} over this pace`;
  }

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
