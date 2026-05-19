import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChecklistService } from '../../services/checklist.service';
import { ChecklistGroup } from '../../models/checklist.model';
import { PullToRefresh } from '../../components/pull-to-refresh/pull-to-refresh';

@Component({
  selector: 'app-checklist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PullToRefresh],
  template: `
    <div class="checklist-page">
      <header class="checklist-header">
        <a routerLink="/" class="back-btn" aria-label="Back to dashboard">&larr;</a>
        <h1 class="checklist-title">Checklist</h1>
      </header>

      <app-pull-to-refresh (refresh)="loadChecklists()" />

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner" aria-hidden="true"></div>
          <p>Loading checklists...</p>
        </div>
      } @else if (error()) {
        <div class="error-state" role="alert">
          <p>{{ error() }}</p>
          <button type="button" (click)="loadChecklists()">Retry</button>
        </div>
      } @else {
        <div class="checklist-container">
          @for (checklist of checklists(); track checklist.title) {
            <section class="checklist-section">
              <h2 class="section-title">{{ checklist.title }}</h2>
              @if (checklist.items.length === 0) {
                <ul class="checklist-list" role="list">
                  <li class="checklist-item empty-state" role="status">
                    <p>No items yet.</p>
                  </li>
                </ul>
              } @else {
                <ul class="checklist-list" role="list">
                  @for (item of checklist.items; track item.sno) {
                    <li class="checklist-item">
                      <span class="item-sno">{{ item.sno }}</span>
                      <span class="item-name">{{ item.name }}</span>
                    </li>
                  }
                </ul>
              }
            </section>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './checklist.scss',
})
export class Checklist implements OnInit {
  private readonly checklistService = inject(ChecklistService);

  protected readonly checklists = signal<ChecklistGroup[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadChecklists();
  }

  protected loadChecklists(): void {
    this.loading.set(true);
    this.error.set(null);
    this.checklistService.getChecklists().subscribe({
      next: (data) => {
        this.checklists.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load checklists. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
