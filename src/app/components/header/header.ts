import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { CycleSelector } from '../cycle-selector/cycle-selector';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggle, CycleSelector, RouterLink],
  template: `
    <header class="app-header">
      <h1 class="app-title">Expenzo</h1>
      <div class="header-actions">
        <a routerLink="/stockpile" class="nav-link" aria-label="Stockpile wishlist">🛒</a>
        <a routerLink="/checklist" class="nav-link" aria-label="Checklist">✅</a>
        <a routerLink="/help" class="nav-link" aria-label="Help & setup guide">❓</a>
        <app-cycle-selector
          [cycleStartDay]="cycleStartDay()"
          (cycleChange)="cycleChange.emit($event)"
        />
        <app-theme-toggle />
      </div>
    </header>
  `,
  styleUrl: './header.scss',
})
export class Header {
  readonly cycleStartDay = input.required<number>();
  readonly cycleChange = output<number>();
}
