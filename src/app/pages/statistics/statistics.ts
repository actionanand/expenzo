import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { CycleData } from '../../models/expense.model';
import { CategoryTrend } from '../../components/category-trend/category-trend';
import { MonthlyComparison } from '../../components/monthly-comparison/monthly-comparison';
import { OverviewStats } from '../../components/overview-stats/overview-stats';

@Component({
  selector: 'app-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CategoryTrend, MonthlyComparison, OverviewStats],
  template: `
    <div class="statistics-content">
      <app-overview-stats [allMonths]="cycles()" />

      @if (cycles().length > 1) {
        <app-monthly-comparison
          [months]="cycles()"
          [title]="cycles().length <= 6 ? 'Last ' + cycles().length + ' Months' : 'All Months'"
        />
      }

      <app-category-trend [allMonths]="cycles()" />
    </div>
  `,
  styleUrl: './statistics.scss',
})
export class Statistics {
  readonly cycles = input.required<CycleData[]>();
}
