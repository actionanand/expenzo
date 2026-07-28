import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon } from '@lucide/angular';
import { Store } from '@ngrx/store';
import { ChartConfiguration, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { CycleData } from '../../../models/expense.model';
import { selectIsDark } from '../../../store/theme/theme.selectors';

interface SpendingPoint {
  readonly key: string;
  readonly label: string;
  readonly daily: number;
  readonly cumulative: number;
}

@Component({
  selector: 'app-spending-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective, LucideDynamicIcon],
  template: `
    <section class="trend-section" aria-labelledby="spending-trend-title">
      <header>
        <p>Timeline</p>
        <h2 id="spending-trend-title">Spending trend</h2>
      </header>

      @if (points().length > 0) {
        <div class="chart-wrap">
          <canvas
            baseChart
            type="line"
            [data]="chartData()"
            [options]="chartOptions()"
            role="img"
            [attr.aria-label]="accessibleLabel()"
          ></canvas>
        </div>
        <table class="visually-hidden">
          <caption>
            Daily and cumulative spending
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Daily spending</th>
              <th scope="col">Cumulative spending</th>
            </tr>
          </thead>
          <tbody>
            @for (point of points(); track point.key) {
              <tr>
                <th scope="row">{{ point.label }}</th>
                <td>{{ formatCurrency(point.daily) }}</td>
                <td>{{ formatCurrency(point.cumulative) }}</td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="empty-state">
          <svg lucideIcon="chart-no-axes-combined" aria-hidden="true"></svg>
          <p>Add expenses to see a spending trend.</p>
        </div>
      }
    </section>
  `,
  styleUrl: './spending-trend-chart.scss',
})
export class SpendingTrendChart {
  readonly cycles = input.required<CycleData[]>();
  private readonly store = inject(Store);
  private readonly isDark = toSignal(this.store.select(selectIsDark), { initialValue: false });

  protected readonly points = computed<SpendingPoint[]>(() => {
    const dailyAmounts = new Map<string, number>();
    for (const cycle of this.cycles()) {
      for (const transaction of cycle.transactions) {
        const date = new Date(transaction.date);
        if (Number.isNaN(date.getTime())) {
          continue;
        }
        const key = this.dateKey(date);
        dailyAmounts.set(key, (dailyAmounts.get(key) ?? 0) + transaction.price);
      }
    }

    let cumulative = 0;
    return [...dailyAmounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, daily]) => {
        cumulative += daily;
        return {
          key,
          label: this.parseDateKey(key).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          }),
          daily,
          cumulative,
        };
      });
  });

  protected readonly accessibleLabel = computed(() => {
    const points = this.points();
    return points.length > 0
      ? `Daily and cumulative spending from ${points[0].label} to ${points[points.length - 1].label}`
      : 'No spending trend for this period';
  });

  protected readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.points().map((point) => point.label),
    datasets: [
      {
        label: 'Daily spending',
        data: this.points().map((point) => point.daily),
        borderColor: '#cf4f46',
        backgroundColor: '#cf4f4620',
        pointBackgroundColor: '#cf4f46',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        fill: true,
        tension: 0.28,
      },
      {
        label: 'Cumulative spending',
        data: this.points().map((point) => point.cumulative),
        borderColor: '#087f5b',
        backgroundColor: 'transparent',
        pointBackgroundColor: '#087f5b',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 3,
        tension: 0.28,
      },
    ],
  }));

  protected readonly chartOptions = computed<ChartConfiguration<'line'>['options']>(() => {
    const text = this.isDark() ? '#b7cbbd' : '#52665a';
    const grid = this.isDark() ? 'rgba(183, 203, 189, 0.18)' : 'rgba(82, 102, 90, 0.18)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            boxWidth: 28,
            boxHeight: 10,
            padding: 14,
            color: text,
            font: { size: 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) =>
              ` ${context.dataset.label}: ${this.formatCurrency(Number(context.raw))}`,
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: {
            color: text,
            maxRotation: 48,
            minRotation: 35,
            autoSkip: true,
            maxTicksLimit: 10,
            font: { size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: grid },
          ticks: {
            color: text,
            font: { size: 10 },
            callback: (value) => this.compactCurrency(Number(value)),
          },
        },
      },
    };
  });

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private compactCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateKey(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
