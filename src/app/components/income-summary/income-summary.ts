import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

import { IncomeSource } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-income-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="income-section">
      <details class="income-details">
        <summary class="income-header">
          <h2 class="section-title">Income Sources</h2>
          <span class="income-total">{{ totalIncome() | money }}</span>
        </summary>
        <div class="income-list">
          @for (source of incomeSources(); track source.name) {
            <div class="income-item">
              <span class="income-name">{{ source.name }}</span>
              <span class="income-amount">{{ source.amount | money }}</span>
            </div>
          }
        </div>
      </details>
    </section>
  `,
  styleUrl: './income-summary.scss',
})
export class IncomeSummary {
  readonly incomeSources = input.required<IncomeSource[]>();

  protected readonly totalIncome = computed(() =>
    this.incomeSources().reduce((sum, s) => sum + s.amount, 0),
  );
}
