import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

import { CategorySummary, Transaction } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';
import { formatIndiaDate } from '../../utils/transaction-date';

@Component({
  selector: 'app-category-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="category-section">
      <h2 class="section-title">Category Breakdown</h2>
      <div class="category-list">
        @for (cat of categories(); track cat.category) {
          <div class="category-card" [class.over-limit]="cat.overLimit">
            <button
              class="category-header"
              type="button"
              [attr.aria-expanded]="expandedCategory() === cat.category"
              (click)="toggleCategory(cat.category)"
            >
              <span class="category-name">{{ cat.category }}</span>
              <span class="category-amount">
                {{ cat.spent | money }}
                @if (cat.limit > 0) {
                  <span class="category-limit"> / {{ cat.limit | money }} </span>
                }
              </span>
            </button>
            @if (cat.limit > 0) {
              <div
                class="progress-bar"
                role="progressbar"
                [attr.aria-valuenow]="cat.spent"
                [attr.aria-valuemin]="0"
                [attr.aria-valuemax]="cat.limit"
                [attr.aria-label]="cat.category + ' spending progress'"
              >
                <div class="progress-fill" [style.width.%]="getProgress(cat)"></div>
              </div>
              <span class="category-remaining" [class.negative]="cat.remaining < 0">
                {{ cat.remaining < 0 ? 'Over by' : 'Left' }}:
                {{ (cat.remaining < 0 ? -cat.remaining : cat.remaining) | money }}
              </span>
            }
            @if (expandedCategory() === cat.category) {
              <div class="category-transactions">
                @for (tx of getTransactionsForCategory(cat.category); track tx.sno) {
                  <div class="cat-tx-item">
                    <div class="cat-tx-info">
                      <span class="cat-tx-name">{{ tx.name }}</span>
                      <span class="cat-tx-date">{{ formatDate(tx.date) }}</span>
                    </div>
                    <span class="cat-tx-price">{{ tx.price | money }}</span>
                  </div>
                } @empty {
                  <p class="cat-tx-empty">No transactions</p>
                }
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './category-breakdown.scss',
})
export class CategoryBreakdown {
  readonly categories = input.required<CategorySummary[]>();
  readonly transactions = input.required<Transaction[]>();

  protected readonly expandedCategory = signal<string | null>(null);

  protected toggleCategory(category: string): void {
    this.expandedCategory.update((current) => (current === category ? null : category));
  }

  protected getTransactionsForCategory(category: string): Transaction[] {
    return this.transactions().filter((tx) => tx.category === category);
  }

  protected getProgress(cat: CategorySummary): number {
    if (cat.limit === 0) return 0;
    return Math.min((cat.spent / cat.limit) * 100, 100);
  }

  protected formatDate(value: string): string {
    return formatIndiaDate(value, { day: '2-digit', month: 'short' });
  }
}
