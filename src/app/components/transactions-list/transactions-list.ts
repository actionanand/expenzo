import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { Transaction } from '../../models/expense.model';

@Component({
  selector: 'app-transactions-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="transactions-section">
      <h2 class="section-title">Recent Transactions</h2>
      <div class="transactions-list">
        @for (tx of sortedTransactions(); track tx.sno) {
          <div class="transaction-item">
            <div class="tx-info">
              <span class="tx-name">{{ tx.name }}</span>
              <span class="tx-meta">
                <span class="tx-category">{{ tx.category }}</span>
                <span class="tx-date">{{ tx.date | date: 'dd MMM' }}</span>
              </span>
            </div>
            <span class="tx-amount">{{
              tx.price | currency: 'INR' : 'symbol-narrow' : '1.0-0'
            }}</span>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './transactions-list.scss',
})
export class TransactionsList {
  readonly transactions = input.required<Transaction[]>();

  protected readonly sortedTransactions = computed(() =>
    [...this.transactions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
  );
}
