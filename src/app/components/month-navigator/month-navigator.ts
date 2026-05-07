import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-month-navigator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="month-nav" aria-label="Month navigation">
      <button
        class="nav-btn"
        [disabled]="!hasPrev()"
        (click)="onPrev()"
        aria-label="Previous month"
        type="button"
      >
        &#8249;
      </button>
      <span class="month-label" aria-live="polite">{{ currentMonth() }}</span>
      <button
        class="nav-btn"
        [disabled]="!hasNext()"
        (click)="onNext()"
        aria-label="Next month"
        type="button"
      >
        &#8250;
      </button>
    </nav>
  `,
  styleUrl: './month-navigator.scss',
})
export class MonthNavigator {
  readonly months = input.required<string[]>();
  readonly selectedIndex = input.required<number>();
  readonly indexChange = output<number>();

  protected readonly currentMonth = computed(() => this.months()[this.selectedIndex()] ?? '');
  protected readonly hasPrev = computed(() => this.selectedIndex() > 0);
  protected readonly hasNext = computed(() => this.selectedIndex() < this.months().length - 1);

  protected onPrev(): void {
    this.indexChange.emit(this.selectedIndex() - 1);
  }

  protected onNext(): void {
    this.indexChange.emit(this.selectedIndex() + 1);
  }
}
