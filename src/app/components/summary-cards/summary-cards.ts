import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { Summary } from '../../models/expense.model';

@Component({
  selector: 'app-summary-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <div class="summary-grid" role="region" aria-label="Expense summary">
      <div class="summary-card income">
        <span class="card-label">Income</span>
        <span class="card-value">{{
          summary().totalIncome | currency: 'INR' : 'symbol-narrow' : '1.0-0'
        }}</span>
      </div>
      <div class="summary-card expense">
        <span class="card-label">Expense</span>
        <span class="card-value">{{
          summary().totalExpense | currency: 'INR' : 'symbol-narrow' : '1.0-0'
        }}</span>
      </div>
      <div
        class="summary-card"
        [class.savings]="!summary().isOverBudget"
        [class.over-budget]="summary().isOverBudget"
      >
        <span class="card-label">{{ isLatest() ? 'Balance' : 'Savings' }}</span>
        <span class="card-value">{{
          summary().savings | currency: 'INR' : 'symbol-narrow' : '1.0-0'
        }}</span>
      </div>
      @if (summary().shortage > 0) {
        <div class="summary-card shortage">
          <span class="card-label">Shortage</span>
          <span class="card-value">{{
            summary().shortage | currency: 'INR' : 'symbol-narrow' : '1.0-0'
          }}</span>
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
