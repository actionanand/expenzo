import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

import { CategorySummary, CycleData } from '../../models/expense.model';

const DAY_MS = 86_400_000;

@Component({
  selector: 'app-completed-cycle-insights',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    <section
      class="cycle-review"
      [class.over-budget]="budgetDifference() < 0"
      aria-labelledby="cycle-review-title"
    >
      <header>
        <div>
          <p>Cycle review</p>
          <h2 id="cycle-review-title">How this cycle finished</h2>
        </div>
        <strong>{{ budgetResult() }}</strong>
      </header>

      <div class="review-metrics">
        <div>
          <span>Actual spent</span>
          <strong>{{ formatCurrency(actualSpent()) }}</strong>
        </div>
        <div>
          <span>Budget</span>
          <strong>{{ formatCurrency(totalBudget()) }}</strong>
          <small>{{ budgetUsedPercent() }}% used</small>
        </div>
        <div>
          <span>{{ netLabel() }}</span>
          <strong>{{ formatCurrency(netAmount()) }}</strong>
        </div>
        <div>
          <span>Daily average</span>
          <strong>{{ formatCurrency(dailyAverage()) }}</strong>
        </div>
      </div>

      <div class="review-details">
        <div>
          <span class="detail-icon" aria-hidden="true">
            <svg lucideIcon="trending-up"></svg>
          </span>
          <span>
            <small>Compared with prior cycle</small>
            <strong>{{ comparisonLabel() }}</strong>
          </span>
        </div>
        <div>
          <span class="detail-icon" aria-hidden="true">
            <svg lucideIcon="shopping-basket"></svg>
          </span>
          <span>
            <small>Highest-spend category</small>
            <strong>{{ topCategoryLabel() }}</strong>
          </span>
        </div>
        <button
          class="detail-action"
          type="button"
          [disabled]="overBudgetCategoryCount() === 0"
          [attr.aria-expanded]="overBudgetCategoryCount() > 0 ? overLimitExpanded() : null"
          aria-controls="over-limit-categories"
          (click)="toggleOverLimitCategories()"
        >
          <span class="detail-icon" aria-hidden="true">
            <svg lucideIcon="circle-check"></svg>
          </span>
          <span class="detail-copy">
            <small>Category limits</small>
            <strong>{{ categoryResult() }}</strong>
          </span>
          @if (overBudgetCategoryCount() > 0) {
            <span class="detail-chevron" [class.expanded]="overLimitExpanded()" aria-hidden="true">
              <svg lucideIcon="chevron-down"></svg>
            </span>
          }
        </button>
      </div>

      @if (overLimitExpanded()) {
        <div class="over-limit-pills" id="over-limit-categories">
          @for (category of overBudgetCategories(); track category.category) {
            <span>
              <strong>{{ category.category }}</strong>
              <small>{{ formatCurrency(category.spent - category.limit) }} over</small>
            </span>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './completed-cycle-insights.scss',
})
export class CompletedCycleInsights {
  readonly cycle = input.required<CycleData>();
  readonly previousCycle = input<CycleData | null>(null);

  protected readonly overLimitExpanded = signal(false);
  protected readonly totalBudget = computed(() =>
    this.cycle().categorySummary.reduce((total, category) => total + category.limit, 0),
  );
  protected readonly actualSpent = computed(() => this.cycle().summary.totalExpense);
  protected readonly budgetDifference = computed(() => this.totalBudget() - this.actualSpent());
  protected readonly budgetUsedPercent = computed(() => {
    const budget = this.totalBudget();
    return budget > 0 ? Math.round((this.actualSpent() / budget) * 100) : 0;
  });
  protected readonly cycleDays = computed(
    () => this.dayDifference(this.cycle().cycleFrom, this.cycle().cycleTo) + 1,
  );
  protected readonly dailyAverage = computed(() => this.actualSpent() / this.cycleDays());
  protected readonly netAmount = computed(() =>
    this.cycle().summary.shortage > 0
      ? this.cycle().summary.shortage
      : this.cycle().summary.savings,
  );
  protected readonly netLabel = computed(() =>
    this.cycle().summary.shortage > 0 ? 'Income shortage' : 'Net saved',
  );
  protected readonly budgetResult = computed(() => {
    const amount = this.formatCurrency(Math.abs(this.budgetDifference()));
    if (this.budgetDifference() > 0) {
      return `${amount} under budget`;
    }
    if (this.budgetDifference() < 0) {
      return `${amount} over budget`;
    }
    return 'Finished on budget';
  });
  protected readonly comparisonLabel = computed(() => {
    const previous = this.previousCycle();
    if (!previous) {
      return 'First available cycle';
    }

    const previousSpent = previous.summary.totalExpense;
    const difference = this.actualSpent() - previousSpent;
    if (difference === 0) {
      return 'Same spend as prior cycle';
    }
    if (previousSpent === 0) {
      return `${this.formatCurrency(Math.abs(difference))} spent after a zero-spend cycle`;
    }

    const percent = Math.round((Math.abs(difference) / previousSpent) * 100);
    const direction = difference < 0 ? 'less' : 'more';
    return `${this.formatCurrency(Math.abs(difference))} ${direction} (${percent}%)`;
  });
  protected readonly topCategory = computed<CategorySummary | null>(() => {
    const categories = this.cycle().categorySummary;
    if (categories.length === 0) {
      return null;
    }
    return categories.reduce((highest, category) =>
      category.spent > highest.spent ? category : highest,
    );
  });
  protected readonly topCategoryLabel = computed(() => {
    const category = this.topCategory();
    return category && category.spent > 0
      ? `${category.category} - ${this.formatCurrency(category.spent)}`
      : 'No category spending';
  });
  protected readonly overBudgetCategories = computed(() =>
    this.cycle()
      .categorySummary.filter((category) => category.overLimit)
      .sort((left, right) => right.spent - right.limit - (left.spent - left.limit)),
  );
  protected readonly overBudgetCategoryCount = computed(() => this.overBudgetCategories().length);
  protected readonly categoryResult = computed(() => {
    const count = this.overBudgetCategoryCount();
    if (count === 0) {
      return 'All categories within limit';
    }
    return `${count} ${count === 1 ? 'category' : 'categories'} over limit`;
  });

  protected toggleOverLimitCategories(): void {
    if (this.overBudgetCategoryCount() > 0) {
      this.overLimitExpanded.update((expanded) => !expanded);
    }
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private dayDifference(from: Date, to: Date): number {
    const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.max(0, Math.round((toUtc - fromUtc) / DAY_MS));
  }
}
