import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { ExpenseService } from '../../services/expense.service';
import { ExpenseResponse, CycleData } from '../../models/expense.model';
import { Header } from '../../components/header/header';
import { SummaryCards } from '../../components/summary-cards/summary-cards';
import { CategoryBreakdown } from '../../components/category-breakdown/category-breakdown';
import { TransactionsList } from '../../components/transactions-list/transactions-list';
import { IncomeSummary } from '../../components/income-summary/income-summary';
import { MonthNavigator } from '../../components/month-navigator/month-navigator';
import { Statistics } from '../statistics/statistics';
import { PullToRefresh } from '../../components/pull-to-refresh/pull-to-refresh';
import { ExportData } from '../../components/export-data/export-data';
import { BudgetCycleHero } from '../../components/budget-cycle-hero/budget-cycle-hero';
import { transformToCycles } from '../../utils/cycle-transformer';
import { CacheService } from '../../services/cache.service';
import { environment } from '../../../environments/environment';

type ViewTab = 'month' | 'stats';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    Header,
    SummaryCards,
    CategoryBreakdown,
    TransactionsList,
    IncomeSummary,
    MonthNavigator,
    Statistics,
    PullToRefresh,
    BudgetCycleHero,
    ExportData,
  ],
  template: `
    <app-header [cycleStartDay]="cycleStartDay()" (cycleChange)="onCycleChange($event)" />
    <app-pull-to-refresh (refresh)="loadData(true)" />

    @if (loading()) {
      <div class="loading">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading expenses...</p>
      </div>
    } @else if (error()) {
      <div class="error" role="alert">
        <p>{{ error() }}</p>
        <button (click)="retry()" type="button">Retry</button>
      </div>
    } @else if (data(); as d) {
      @if (d.isDevelopment) {
        <div class="dev-banner" role="status">Sample data — verify your API token</div>
      }

      <div class="dashboard-content">
        @if (d.config.cycle; as cycle) {
          <p class="cycle-period">
            {{ cycle.from | date: 'dd MMM yyyy' }} &mdash;
            {{ cycle.to | date: 'dd MMM yyyy' }}
          </p>
        }

        <nav class="view-tabs" role="tablist" aria-label="View selection">
          <button
            role="tab"
            [attr.aria-selected]="activeTab() === 'month'"
            [class.active]="activeTab() === 'month'"
            (click)="activeTab.set('month')"
            type="button"
          >
            Monthly
          </button>
          <button
            role="tab"
            [attr.aria-selected]="activeTab() === 'stats'"
            [class.active]="activeTab() === 'stats'"
            (click)="activeTab.set('stats')"
            type="button"
          >
            Statistics
          </button>
        </nav>

        @if (activeTab() === 'month') {
          @if (cycleLabels().length > 1) {
            <app-month-navigator
              [months]="cycleLabels()"
              [selectedIndex]="selectedCycleIndex()"
              (indexChange)="selectedCycleIndex.set($event)"
            />
          }
          @if (selectedCycle(); as cycle) {
            <p class="cycle-range">
              {{ cycle.cycleFrom | date: 'dd MMM yyyy' }} &mdash;
              {{ cycle.cycleTo | date: 'dd MMM yyyy' }}
              <span class="tx-count">({{ cycle.transactionCount }} entries)</span>
            </p>
            @if (isLatestCycle()) {
              <app-budget-cycle-hero [cycle]="cycle" />
            }
            <app-summary-cards [summary]="cycle.summary" [isLatest]="isLatestCycle()" />
            <app-category-breakdown
              [categories]="cycle.categorySummary"
              [transactions]="cycle.transactions"
            />
            <app-income-summary [incomeSources]="cycle.incomeSources" />
            <app-transactions-list [transactions]="cycle.transactions" />
            <app-export-data [cycle]="cycle" />
          }
        } @else {
          <app-statistics [cycles]="cycles()" />
        }
      </div>
    }
  `,
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly expenseService = inject(ExpenseService);
  private readonly cache = inject(CacheService);

  protected readonly data = signal<ExpenseResponse | null>(null);
  protected readonly cycles = signal<CycleData[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cycleStartDay = signal(environment.defaultCycleStartDay);
  protected readonly activeTab = signal<ViewTab>('month');
  protected readonly selectedCycleIndex = signal(0);

  protected readonly isLatestCycle = computed(() => {
    const all = this.cycles();
    const idx = this.selectedCycleIndex();
    return idx === all.length - 1;
  });

  protected readonly cycleLabels = computed(() => this.cycles().map((c) => c.label));

  protected readonly selectedCycle = computed<CycleData | null>(() => {
    const all = this.cycles();
    const idx = this.selectedCycleIndex();
    return all[idx] ?? null;
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected onCycleChange(day: number): void {
    this.cycleStartDay.set(day);
    this.loadData();
  }

  protected retry(): void {
    this.loadData(true);
  }

  protected loadData(forceRefresh = false): void {
    const cacheKey = `dashboard_${this.cycleStartDay()}`;

    // Check memory cache (valid for 5 min) unless force refresh (pull-to-refresh)
    if (!forceRefresh) {
      const cached = this.cache.get<ExpenseResponse>(cacheKey);
      if (cached) {
        this.applyData(cached);
        return;
      }
    }

    this.loading.set(true);
    this.error.set(null);
    this.expenseService.getExpenses(this.cycleStartDay()).subscribe({
      next: (response) => {
        this.cache.set(cacheKey, response);
        this.applyData(response);
      },
      error: () => {
        // Offline fallback — use last stored data
        const offline = this.cache.getOffline<ExpenseResponse>(cacheKey);
        if (offline) {
          this.applyData(offline);
          this.cache.showOfflineToast();
        } else {
          this.error.set('Failed to load expense data. Please try again.');
          this.loading.set(false);
        }
      },
    });
  }

  private applyData(response: ExpenseResponse): void {
    this.data.set(response);
    const cycleData = transformToCycles(response);
    this.cycles.set(cycleData);
    const lastIndex = cycleData.length > 0 ? cycleData.length - 1 : 0;
    this.selectedCycleIndex.set(lastIndex);
    this.loading.set(false);
  }
}
