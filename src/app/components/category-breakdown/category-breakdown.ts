import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { CategorySummary } from '../../models/expense.model';

@Component({
  selector: 'app-category-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <section class="category-section">
      <h2 class="section-title">Category Breakdown</h2>
      <div class="category-list">
        @for (cat of categories(); track cat.category) {
          <div class="category-card" [class.over-limit]="cat.overLimit">
            <div class="category-header">
              <span class="category-name">{{ cat.category }}</span>
              <span class="category-amount">
                {{ cat.spent | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}
                @if (cat.limit > 0) {
                  <span class="category-limit">
                    / {{ cat.limit | currency: 'INR' : 'symbol-narrow' : '1.0-0' }}
                  </span>
                }
              </span>
            </div>
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
                {{
                  (cat.remaining < 0 ? -cat.remaining : cat.remaining)
                    | currency: 'INR' : 'symbol-narrow' : '1.0-0'
                }}
              </span>
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

  protected getProgress(cat: CategorySummary): number {
    if (cat.limit === 0) return 0;
    return Math.min((cat.spent / cat.limit) * 100, 100);
  }
}
