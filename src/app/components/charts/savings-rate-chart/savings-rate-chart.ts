import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { CycleData } from '../../../models/expense.model';

@Component({
  selector: 'app-savings-rate-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  template: `
    <section class="chart-section">
      <h2 class="section-title">Savings Rate</h2>
      <div class="chart-wrap">
        <canvas
          baseChart
          [type]="'bar'"
          [data]="chartData()"
          [options]="chartOptions()"
          aria-label="Savings rate per month"
        ></canvas>
      </div>
    </section>
  `,
  styleUrl: './savings-rate-chart.scss',
})
export class SavingsRateChart {
  readonly cycles = input.required<CycleData[]>();

  protected readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const all = this.cycles();
    const rates = all.map((c) =>
      c.summary.totalIncome > 0 ? Math.round((c.summary.savings / c.summary.totalIncome) * 100) : 0,
    );
    return {
      labels: all.map((c) => c.label),
      datasets: [
        {
          label: 'Savings %',
          data: rates,
          backgroundColor: rates.map((r) => (r >= 0 ? '#4caf5099' : '#f4433699')),
          borderColor: rates.map((r) => (r >= 0 ? '#4caf50' : '#f44336')),
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          callback: (value) => `${value}%`,
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: { font: { size: 10 }, maxRotation: 45 },
        grid: { display: false },
      },
    },
  }));
}
