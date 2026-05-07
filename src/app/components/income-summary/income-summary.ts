import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { IncomeSource } from '../../models/expense.model';

@Component({
  selector: 'app-income-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <section class="income-section">
      <h2 class="section-title">Income Sources</h2>
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
    </section>
  `,
  styleUrl: './income-summary.scss',
})
export class IncomeSummary {
  readonly incomeSources = input.required<IncomeSource[]>();
}
