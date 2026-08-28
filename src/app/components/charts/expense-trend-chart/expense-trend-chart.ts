import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { CycleData } from '../../../models/expense.model';

@Component({
  selector: 'app-expense-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  template: `
    <section class="chart-section">
      <h2 class="section-title">Expense Trend</h2>
      <div class="chart-wrap">
        <canvas
          baseChart
          [type]="'line'"
          [data]="chartData()"
          [options]="chartOptions()"
          aria-label="Expense trend over months"
        ></canvas>
      </div>
    </section>
  `,
  styleUrl: './expense-trend-chart.scss',
})
export class ExpenseTrendChart {
  readonly cycles = input.required<CycleData[]>();

  protected readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const all = this.cycles();
    return {
      labels: all.map((c) => c.label),
      datasets: [
        {
          label: 'Expense',
          data: all.map((c) => c.summary.totalExpense),
          borderColor: '#f44336',
          backgroundColor: '#f4433620',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#f44336',
        },
        {
          label: 'Savings',
          data: all.map((c) => c.summary.savings),
          borderColor: '#4caf50',
          backgroundColor: '#4caf5020',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#4caf50',
        },
      ],
    };
  });

  protected readonly chartOptions = computed<ChartConfiguration<'line'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 12,
          usePointStyle: false,
          boxWidth: 10,
          boxHeight: 10,
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
