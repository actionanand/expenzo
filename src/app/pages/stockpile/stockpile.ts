import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { WishlistService } from '../../services/wishlist.service';
import { WishlistItem } from '../../models/wishlist.model';
import { PullToRefresh } from '../../components/pull-to-refresh/pull-to-refresh';
import { CacheService } from '../../services/cache.service';

@Component({
  selector: 'app-stockpile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, PullToRefresh, RouterLink],
  template: `
    <div class="stockpile-page">
      <header class="stockpile-header">
        <a routerLink="/" class="back-btn" aria-label="Back to dashboard">
          <svg lucideIcon="chevron-right" aria-hidden="true"></svg>
        </a>
        <h1 class="stockpile-title">Stockpile</h1>
        <span class="item-count">{{ items().length }} items</span>
      </header>

      <app-pull-to-refresh (refresh)="loadItems(true)" />

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p>Loading your list...</p>
        </div>
      } @else if (error()) {
        <div class="error-state" role="alert">
          <p>{{ error() }}</p>
          <button type="button" (click)="loadItems()">Retry</button>
        </div>
      } @else if (items().length === 0) {
        <ul class="stockpile-list" role="list">
          <li class="stockpile-item empty-state" role="status">
            <p>No items in your stockpile yet.</p>
          </li>
        </ul>
      } @else {
        <ul class="stockpile-list" role="list">
          @for (item of items(); track item.sno) {
            <li class="stockpile-item">
              <div class="item-main">
                <span class="item-sno">{{ item.sno }}</span>
                <span class="item-name">{{ item.name }}</span>
              </div>
              <div class="item-details">
                <!-- eslint-disable-next-line @angular-eslint/template/eqeqeq -->
                @if (item.quantity != null) {
                  <span class="item-qty">{{ item.quantity }} {{ item.unit }}</span>
                } @else {
                  <span class="item-qty">{{ item.unit }}</span>
                }
              </div>
              @if (item.comment) {
                <p class="item-comment">{{ item.comment }}</p>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './stockpile.scss',
})
export class Stockpile implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly cache = inject(CacheService);

  protected readonly items = signal<WishlistItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadItems();
  }

  protected loadItems(forceRefresh = false): void {
    const cacheKey = 'stockpile';

    if (!forceRefresh) {
      const cached = this.cache.get<WishlistItem[]>(cacheKey);
      if (cached) {
        this.items.set(cached);
        this.loading.set(false);
        return;
      }
    }

    this.loading.set(true);
    this.error.set(null);
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.cache.set(cacheKey, data);
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        const offline = this.cache.getOffline<WishlistItem[]>(cacheKey);
        if (offline) {
          this.items.set(offline);
          this.loading.set(false);
          this.cache.showOfflineToast();
        } else {
          this.error.set('Failed to load wishlist. Please try again.');
          this.loading.set(false);
        }
      },
    });
  }
}
