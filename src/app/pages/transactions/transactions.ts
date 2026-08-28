import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';

import {
  AppSelectOption,
  AppSelectPicker,
} from '../../components/app-select-picker/app-select-picker';
import { Header } from '../../components/header/header';
import { PullToRefresh } from '../../components/pull-to-refresh/pull-to-refresh';
import { TransactionExport } from '../../components/transaction-export/transaction-export';
import { CycleData, ExpenseResponse, Transaction } from '../../models/expense.model';
import { MoneyPipe } from '../../pipes/money.pipe';
import { CacheService } from '../../services/cache.service';
import { CyclePreferenceService } from '../../services/cycle-preference.service';
import { ExpenseService } from '../../services/expense.service';
import { transformToCycles } from '../../utils/cycle-transformer';
import { formatIndiaDate, todayInIndia, transactionTimestamp } from '../../utils/transaction-date';

interface TransactionCycleGroup {
  readonly key: string;
  readonly cycle: CycleData;
  readonly transactions: readonly Transaction[];
  readonly total: number;
  readonly isCurrent: boolean;
}

@Component({
  selector: 'app-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppSelectPicker,
    DatePipe,
    Header,
    LucideDynamicIcon,
    MoneyPipe,
    PullToRefresh,
    ReactiveFormsModule,
    TransactionExport,
  ],
  template: `
    <app-header [cycleStartDay]="cycleStartDay()" (cycleChange)="onCycleChange($event)" />
    <app-pull-to-refresh (refresh)="loadData(true)" />

    <main class="transactions-page">
      <header class="page-heading">
        <div>
          <p>All budget cycles</p>
          <h1>Transactions</h1>
          <span>Track spending across the current cycle and your complete history.</span>
        </div>
      </header>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p>Loading transactions...</p>
        </div>
      } @else if (error()) {
        <div class="error-state" role="alert">
          <p>{{ error() }}</p>
          <button type="button" (click)="loadData(true)">Retry</button>
        </div>
      } @else {
        @if (isDevelopment()) {
          <p class="sample-banner" role="status">Sample data — verify your API token</p>
        }

        <section class="tracker-summary" aria-label="Filtered transaction summary">
          <div>
            <span>Transactions</span>
            <strong>{{ filteredTransactionCount() }}</strong>
          </div>
          <div>
            <span>Total spent</span>
            <strong>{{ filteredTotal() | money }}</strong>
          </div>
          <div>
            <span>Average</span>
            <strong>{{ filteredAverage() | money }}</strong>
          </div>
        </section>

        <section class="tracker-filters" aria-labelledby="filters-title">
          <button
            class="utility-toggle"
            type="button"
            [attr.aria-expanded]="filtersExpanded()"
            aria-controls="transaction-filters"
            (click)="toggleFilters()"
          >
            <span class="utility-icon" aria-hidden="true">
              <svg lucideIcon="search"></svg>
            </span>
            <span class="utility-copy">
              <span class="utility-title" id="filters-title">Find transactions</span>
              <span>
                {{
                  hasActiveFilters()
                    ? 'Filters applied to transaction history'
                    : 'Search names or filter categories'
                }}
              </span>
            </span>
            @if (hasActiveFilters()) {
              <span class="utility-status">Active</span>
            }
            <span class="utility-chevron" [class.expanded]="filtersExpanded()" aria-hidden="true">
              <svg lucideIcon="chevron-down"></svg>
            </span>
          </button>

          @if (filtersExpanded()) {
            <div class="filter-panel" id="transaction-filters">
              @if (hasActiveFilters()) {
                <div class="filter-actions">
                  <span>Filtering all available cycles</span>
                  <button class="clear-filters" type="button" (click)="clearFilters()">
                    Clear
                  </button>
                </div>
              }

              <div class="filter-controls">
                <label class="search-field">
                  <span>Search</span>
                  <div>
                    <svg lucideIcon="search" aria-hidden="true"></svg>
                    <input
                      [formControl]="searchControl"
                      type="search"
                      inputmode="search"
                      autocomplete="off"
                      placeholder="Transaction name"
                      (input)="onSearchChanged()"
                    />
                  </div>
                </label>

                <app-select-picker
                  label="Category"
                  sheetTitle="Filter by category"
                  [options]="categoryOptions()"
                  [value]="selectedCategory()"
                  (valueChange)="onCategoryChange($event)"
                />
              </div>
            </div>
          }
        </section>

        <app-transaction-export
          [cycles]="cycles()"
          [category]="selectedCategory()"
          [search]="searchTerm()"
        />

        <section class="cycle-groups" aria-labelledby="history-title">
          <header class="history-heading">
            <div>
              <h2 id="history-title">Cycle history</h2>
              <p>
                {{
                  hasActiveFilters() ? 'Matching cycles are expanded.' : 'Current cycle is open.'
                }}
              </p>
            </div>
            <span>{{ filteredCycleGroups().length }} cycles</span>
          </header>

          @if (filteredCycleGroups().length === 0) {
            <div class="empty-state" role="status">
              <svg lucideIcon="search" aria-hidden="true"></svg>
              <h3>No matching transactions</h3>
              <p>Try another category or transaction name.</p>
            </div>
          } @else {
            @for (group of filteredCycleGroups(); track group.key) {
              <article class="cycle-group" [class.current]="group.isCurrent">
                <button
                  class="cycle-toggle"
                  type="button"
                  [attr.aria-expanded]="isExpanded(group.key)"
                  [attr.aria-controls]="'transactions-' + group.key"
                  (click)="toggleCycle(group.key)"
                >
                  <span class="cycle-chevron" [class.expanded]="isExpanded(group.key)">
                    <svg lucideIcon="chevron-right" aria-hidden="true"></svg>
                  </span>
                  <span class="cycle-copy">
                    <strong>
                      {{ group.cycle.cycleFrom | date: 'dd MMM yyyy' }} —
                      {{ group.cycle.cycleTo | date: 'dd MMM yyyy' }}
                    </strong>
                    <small>
                      {{ group.transactions.length }} transactions
                      @if (group.isCurrent) {
                        <span class="current-label">Current</span>
                      }
                    </small>
                  </span>
                  <strong class="cycle-total">{{ group.total | money }}</strong>
                </button>

                @if (isExpanded(group.key)) {
                  <div class="transaction-list" [id]="'transactions-' + group.key">
                    @if (group.transactions.length === 0) {
                      <p class="cycle-empty">No transactions in this cycle.</p>
                    } @else {
                      @for (
                        transaction of group.transactions;
                        track transaction.date + '-' + transaction.sno + '-' + $index
                      ) {
                        <div class="transaction-row">
                          <div class="transaction-copy">
                            <strong>{{ transaction.name }}</strong>
                            <span>
                              <small class="category-label">
                                {{ displayCategory(transaction.category) }}
                              </small>
                              <small>{{ formatTransactionDate(transaction.date) }}</small>
                            </span>
                          </div>
                          <strong class="transaction-amount">{{
                            transaction.price | money
                          }}</strong>
                        </div>
                      }
                    }
                  </div>
                }
              </article>
            }
          }
        </section>
      }
    </main>
  `,
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  private readonly expenseService = inject(ExpenseService);
  private readonly cache = inject(CacheService);
  private readonly cyclePreference = inject(CyclePreferenceService);

  protected readonly cycleStartDay = this.cyclePreference.day;
  protected readonly cycles = signal<readonly CycleData[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly isDevelopment = signal(false);
  protected readonly selectedCategory = signal('all');
  protected readonly searchTerm = signal('');
  protected readonly filtersExpanded = signal(false);
  protected readonly expandedKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  protected readonly allTransactions = computed(() =>
    this.cycles().flatMap((cycle) => cycle.transactions),
  );
  protected readonly currentCycle = computed(() => {
    const cycles = this.cycles();
    const today = todayInIndia();
    return (
      cycles.find(
        (cycle) =>
          today >= this.atStartOfDay(cycle.cycleFrom) && today <= this.atStartOfDay(cycle.cycleTo),
      ) ?? cycles.at(-1)
    );
  });
  protected readonly categoryOptions = computed<readonly AppSelectOption[]>(() => {
    const counts = new Map<string, number>();
    for (const transaction of this.allTransactions()) {
      const category = this.normalizeCategory(transaction.category);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    const options = [...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([value, count]) => ({
        value,
        label: this.capitalizeCategory(value),
        detail: `${count} ${count === 1 ? 'transaction' : 'transactions'}`,
      }));

    return [
      {
        value: 'all',
        label: 'All categories',
        detail: `${this.allTransactions().length} transactions`,
      },
      ...options,
    ];
  });
  protected readonly hasActiveFilters = computed(
    () => this.selectedCategory() !== 'all' || this.searchTerm().trim().length > 0,
  );
  protected readonly filteredCycleGroups = computed<readonly TransactionCycleGroup[]>(() => {
    const cycles = this.cycles();
    const currentCycle = this.currentCycle();
    const category = this.selectedCategory();
    const search = this.searchTerm().trim().toLocaleLowerCase();

    return [...cycles]
      .reverse()
      .map((cycle) => {
        const transactions = [...cycle.transactions]
          .filter((transaction) => {
            const categoryMatches =
              category === 'all' || this.normalizeCategory(transaction.category) === category;
            const searchMatches =
              search.length === 0 || transaction.name.toLocaleLowerCase().includes(search);
            return categoryMatches && searchMatches;
          })
          .sort(
            (left, right) => transactionTimestamp(right.date) - transactionTimestamp(left.date),
          );

        return {
          key: cycle.cycleFrom.getTime().toString(),
          cycle,
          transactions,
          total: transactions.reduce((total, transaction) => total + transaction.price, 0),
          isCurrent: cycle === currentCycle,
        };
      })
      .filter(
        (group) => group.transactions.length > 0 || (!this.hasActiveFilters() && group.isCurrent),
      );
  });
  protected readonly filteredTransactionCount = computed(() =>
    this.filteredCycleGroups().reduce((count, group) => count + group.transactions.length, 0),
  );
  protected readonly filteredTotal = computed(() =>
    this.filteredCycleGroups().reduce((total, group) => total + group.total, 0),
  );
  protected readonly filteredAverage = computed(() => {
    const count = this.filteredTransactionCount();
    return count > 0 ? this.filteredTotal() / count : 0;
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected onCycleChange(day: number): void {
    this.cyclePreference.set(day);
    this.loadData();
  }

  protected loadData(forceRefresh = false): void {
    const cacheKey = `dashboard_${this.cycleStartDay()}`;
    if (!forceRefresh) {
      const cached = this.cache.get<ExpenseResponse>(cacheKey);
      if (cached) {
        this.applyData(cached);
        return;
      }
    }

    this.loading.set(true);
    this.error.set('');
    this.expenseService.getExpenses(this.cycleStartDay()).subscribe({
      next: (response) => {
        this.cache.set(cacheKey, response);
        this.applyData(response);
      },
      error: () => {
        const offline = this.cache.getOffline<ExpenseResponse>(cacheKey);
        if (offline) {
          this.applyData(offline);
          this.cache.showOfflineToast();
        } else {
          this.error.set('Failed to load transactions. Please try again.');
          this.loading.set(false);
        }
      },
    });
  }

  protected onSearchChanged(): void {
    this.searchTerm.set(this.searchControl.value.trim().toLocaleLowerCase());
    this.expandFilteredCycles();
  }

  protected onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.expandFilteredCycles();
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.expandCurrentCycle();
  }

  protected toggleFilters(): void {
    this.filtersExpanded.update((expanded) => !expanded);
  }

  protected toggleCycle(key: string): void {
    this.expandedKeys.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  protected isExpanded(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  protected displayCategory(category: string): string {
    return this.capitalizeCategory(this.normalizeCategory(category));
  }

  protected formatTransactionDate(value: string): string {
    return formatIndiaDate(value, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private applyData(response: ExpenseResponse): void {
    this.cycles.set(transformToCycles(response, this.cycleStartDay()));
    this.isDevelopment.set(response.isDevelopment);
    this.loading.set(false);
    if (this.hasActiveFilters()) {
      this.expandFilteredCycles();
    } else {
      this.expandCurrentCycle();
    }
  }

  private expandCurrentCycle(): void {
    const current = this.currentCycle();
    this.expandedKeys.set(current ? new Set([current.cycleFrom.getTime().toString()]) : new Set());
  }

  private expandFilteredCycles(): void {
    if (!this.hasActiveFilters()) {
      this.expandCurrentCycle();
      return;
    }
    this.expandedKeys.set(new Set(this.filteredCycleGroups().map((group) => group.key)));
  }

  private normalizeCategory(category: string): string {
    return category.trim().replace(/\s+/g, ' ').toLocaleLowerCase() || 'uncategorized';
  }

  private atStartOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private capitalizeCategory(category: string): string {
    return category.charAt(0).toLocaleUpperCase() + category.slice(1);
  }
}
