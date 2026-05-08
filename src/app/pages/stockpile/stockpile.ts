import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { WishlistService } from '../../services/wishlist.service';
import { WishlistItem } from '../../models/wishlist.model';
import { PullToRefresh } from '../../components/pull-to-refresh/pull-to-refresh';

@Component({
  selector: 'app-stockpile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PullToRefresh],
  template: `
    <div class="stockpile-page">
      <header class="stockpile-header">
        <a routerLink="/" class="back-btn" aria-label="Back to dashboard">&larr;</a>
        <h1 class="stockpile-title">Stockpile</h1>
        <span class="item-count">{{ items().length }} items</span>
      </header>

      <app-pull-to-refresh (refresh)="loadItems()" />

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

  protected readonly items = signal<WishlistItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadItems();
  }

  protected loadItems(): void {
    this.loading.set(true);
    this.error.set(null);
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load wishlist. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
