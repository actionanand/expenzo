import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';

import { CycleData } from '../../models/expense.model';
import { CategoryTrend } from '../../components/category-trend/category-trend';
import { MonthlyComparison } from '../../components/monthly-comparison/monthly-comparison';
import { OverviewStats } from '../../components/overview-stats/overview-stats';
import { ExpensePieChart } from '../../components/charts/expense-pie-chart/expense-pie-chart';
import { ExpenseBarChart } from '../../components/charts/expense-bar-chart/expense-bar-chart';
import { ExpenseTrendChart } from '../../components/charts/expense-trend-chart/expense-trend-chart';
import { SavingsRateChart } from '../../components/charts/savings-rate-chart/savings-rate-chart';
import { SpendingTrendChart } from '../../components/charts/spending-trend-chart/spending-trend-chart';

type RangeKey = 'current' | '3m' | '6m' | '1y' | 'all';

interface RangeOption {
  key: RangeKey;
  label: string;
}

@Component({
  selector: 'app-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CategoryTrend,
    MonthlyComparison,
    OverviewStats,
    ExpensePieChart,
    ExpenseBarChart,
    ExpenseTrendChart,
    SavingsRateChart,
    SpendingTrendChart,
  ],
  template: `
    <div class="statistics-content">
      <div class="range-selector">
        @for (opt of rangeOptions; track opt.key) {
          <button
            type="button"
            [class.active]="selectedRange() === opt.key"
            (click)="selectedRange.set(opt.key)"
          >
            {{ opt.label }}
          </button>
        }
      </div>

      <app-spending-trend-chart [cycles]="filteredCycles()" />

      @if (selectedRange() === 'current') {
        <app-expense-pie-chart [allCycles]="filteredCycles()" />
      } @else {
        @if (filteredCycles().length > 0) {
          <app-overview-stats [allMonths]="filteredCycles()" />
          <app-expense-bar-chart [cycles]="filteredCycles()" />
          <app-expense-trend-chart [cycles]="filteredCycles()" />
          <app-savings-rate-chart [cycles]="filteredCycles()" />

          @if (filteredCycles().length > 1) {
            <app-monthly-comparison [months]="filteredCycles()" [title]="rangeTitle()" />
          }

          <app-category-trend [allMonths]="filteredCycles()" />
        }
      }
    </div>
  `,
  styleUrl: './statistics.scss',
})
export class Statistics {
  readonly cycles = input.required<readonly CycleData[]>();
  readonly activeCycleIndex = input<number | null>(null);

  protected readonly selectedRange = signal<RangeKey>('current');

  protected readonly rangeOptions: RangeOption[] = [
    { key: 'current', label: 'Selected' },
    { key: '3m', label: '3 Months' },
    { key: '6m', label: '6 Months' },
    { key: '1y', label: '1 Year' },
    { key: 'all', label: 'All' },
  ];

  protected readonly rangeEndIndex = computed(() => {
    const all = this.cycles();
    const requested = this.activeCycleIndex();
    if (requested === null) {
      return all.length - 1;
    }
    return Math.min(Math.max(0, requested), all.length - 1);
  });

  protected readonly filteredCycles = computed<CycleData[]>(() => {
    const all = this.cycles();
    const range = this.selectedRange();
    const end = this.rangeEndIndex();
    if (all.length === 0 || end < 0) {
      return [];
    }

    if (range === 'current') {
      return [all[end]];
    }

    let count = end + 1;
    if (range === '3m') count = 3;
    else if (range === '6m') count = 6;
    else if (range === '1y') count = 12;

    return all.slice(Math.max(0, end - count + 1), end + 1);
  });

  protected readonly rangeTitle = computed(() => {
    const len = this.filteredCycles().length;
    const range = this.selectedRange();
    if (range === 'all') return `All (${len} months)`;
    return `Last ${len} month${len > 1 ? 's' : ''}`;
  });
}
