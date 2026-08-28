import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Summary } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-summary-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <div class="summary-grid" role="region" aria-label="Expense summary">
      <div class="summary-card income">
        <span class="card-label">Income</span>
        <span class="card-value">{{ summary().totalIncome | money }}</span>
      </div>
      <div class="summary-card expense">
        <span class="card-label">Expense</span>
        <span class="card-value">{{ summary().totalExpense | money }}</span>
      </div>
      <div
        class="summary-card"
        [class.savings]="!summary().isOverBudget"
        [class.over-budget]="summary().isOverBudget"
      >
        <span class="card-label">{{ isLatest() ? 'Balance' : 'Savings' }}</span>
        <span class="card-value">{{ summary().savings | money }}</span>
      </div>
      @if (summary().shortage > 0) {
        <div class="summary-card shortage">
          <span class="card-label">Shortage</span>
          <span class="card-value">{{ summary().shortage | money }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './summary-cards.scss',
})
export class SummaryCards {
  readonly summary = input.required<Summary>();
  readonly isLatest = input(false);
}
