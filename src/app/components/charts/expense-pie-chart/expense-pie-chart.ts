import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { CycleData } from '../../../models/expense.model';

@Component({
  selector: 'app-expense-pie-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  template: `
    <section class="chart-section">
      <h2 class="section-title">Expense by Category</h2>
      <div class="chart-wrap">
        <canvas
          baseChart
          [type]="'doughnut'"
          [data]="chartData()"
          [options]="chartOptions()"
          aria-label="Expense distribution by category"
        ></canvas>
      </div>
    </section>
  `,
  styleUrl: './expense-pie-chart.scss',
})
export class ExpensePieChart {
  readonly cycle = input.required<CycleData>();

  private readonly COLORS = [
    '#4caf50',
    '#2196f3',
    '#ff9800',
    '#e91e63',
    '#9c27b0',
    '#00bcd4',
    '#ff5722',
    '#795548',
    '#607d8b',
    '#8bc34a',
  ];

  protected readonly chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const cats = this.cycle().categorySummary.filter((c) => c.spent > 0);
    return {
      labels: cats.map((c) => c.category),
      datasets: [
        {
          data: cats.map((c) => c.spent),
          backgroundColor: this.COLORS.slice(0, cats.length),
          borderWidth: 2,
          borderColor: 'transparent',
        },
      ],
    };
  });

  protected readonly chartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 11 },
        },
      },
    },
  }));
}
