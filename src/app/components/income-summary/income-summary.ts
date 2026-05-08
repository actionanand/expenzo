import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { IncomeSource } from '../../models/expense.model';

@Component({
  selector: 'app-income-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <section class="income-section">
      <details class="income-details">
        <summary class="income-header">
          <h2 class="section-title">Income Sources</h2>
          <span class="income-total">{{
            totalIncome() | currency: 'INR' : 'symbol-narrow' : '1.0-0'
          }}</span>
        </summary>
        <div class="income-list">
          @for (source of incomeSources(); track source.name) {
            <div class="income-item">
              <span class="income-name">{{ source.name }}</span>
              <span class="income-amount">{{
                source.amount | currency: 'INR' : 'symbol-narrow' : '1.0-0'
              }}</span>
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
