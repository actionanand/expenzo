import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';

import { Transaction } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';
import { formatIndiaDate, transactionTimestamp } from '../../utils/transaction-date';

@Component({
  selector: 'app-transactions-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="transactions-section">
      <h2 class="section-title">Recent Transactions</h2>
      <div class="transactions-list">
        @for (tx of visibleTransactions(); track tx.sno) {
          <div class="transaction-item">
            <div class="tx-info">
              <span class="tx-name">{{ tx.name }}</span>
              <span class="tx-meta">
                <span class="tx-category">{{ tx.category }}</span>
                <span class="tx-date">{{ formatDate(tx.date) }}</span>
              </span>
            </div>
            <span class="tx-amount">{{ tx.price | money }}</span>
          </div>
        }
      </div>
      @if (hasMore()) {
        <button class="load-more-btn" type="button" (click)="loadMore()">
          Show more ({{ remainingCount() }} left)
        </button>
      }
    </section>
  `,
  styleUrl: './transactions-list.scss',
})
export class TransactionsList {
  readonly transactions = input.required<Transaction[]>();

  private readonly PAGE_SIZE = 15;
  protected readonly visibleCount = signal(this.PAGE_SIZE);

  protected readonly sortedTransactions = computed(() =>
    [...this.transactions()].sort(
      (a, b) => transactionTimestamp(b.date) - transactionTimestamp(a.date),
    ),
  );

  protected readonly visibleTransactions = computed(() =>
    this.sortedTransactions().slice(0, this.visibleCount()),
  );

  protected readonly hasMore = computed(
    () => this.visibleCount() < this.sortedTransactions().length,
  );

  protected readonly remainingCount = computed(
    () => this.sortedTransactions().length - this.visibleCount(),
  );

  protected loadMore(): void {
    this.visibleCount.update((c) => c + this.PAGE_SIZE);
  }

  protected formatDate(value: string): string {
    return formatIndiaDate(value, { day: '2-digit', month: 'short' });
  }
}
