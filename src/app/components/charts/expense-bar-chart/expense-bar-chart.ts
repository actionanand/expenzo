import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { CycleData } from '../../../models/expense.model';

@Component({
  selector: 'app-expense-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  template: `
    <section class="chart-section">
      <h2 class="section-title">Income vs Expense</h2>
      <div class="chart-wrap">
        <canvas
          baseChart
          [type]="'bar'"
          [data]="chartData()"
          [options]="chartOptions()"
          aria-label="Income vs expense comparison across months"
        ></canvas>
      </div>
    </section>
  `,
  styleUrl: './expense-bar-chart.scss',
})
export class ExpenseBarChart {
  readonly cycles = input.required<CycleData[]>();

  protected readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const all = this.cycles();
    return {
      labels: all.map((c) => c.label),
      datasets: [
        {
          label: 'Income',
          data: all.map((c) => c.summary.totalIncome),
          backgroundColor: '#4caf5099',
          borderColor: '#4caf50',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Expense',
          data: all.map((c) => c.summary.totalExpense),
          backgroundColor: '#f4433699',
          borderColor: '#f44336',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  });

  protected readonly chartOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
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
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: { font: { size: 10 }, maxRotation: 45 },
        grid: { display: false },
      },
    },
  }));
}
