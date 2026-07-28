import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { CycleSelector } from '../cycle-selector/cycle-selector';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CycleSelector, LucideDynamicIcon, RouterLink, ThemeToggle],
  template: `
    <header class="app-header">
      <a routerLink="/" class="app-title" aria-label="Expenzo home">Expenzo</a>
      <div class="header-actions">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            class="nav-link"
            [attr.aria-label]="item.label"
            [attr.title]="item.label"
          >
            <svg [lucideIcon]="item.icon" aria-hidden="true"></svg>
          </a>
        }
        @if (cycleStartDay() !== null) {
          <app-cycle-selector
            [cycleStartDay]="cycleStartDay() ?? 1"
            (cycleChange)="cycleChange.emit($event)"
          />
        }
        <app-theme-toggle />
      </div>
    </header>
  `,
  styleUrl: './header.scss',
})
export class Header {
  readonly cycleStartDay = input<number | null>(null);
  readonly cycleChange = output<number>();

  protected readonly navItems = [
    { route: '/stockpile', label: 'Stockpile wishlist', icon: 'shopping-basket' },
    { route: '/checklist', label: 'Checklist', icon: 'circle-check' },
    { route: '/help', label: 'Help and setup guide', icon: 'circle-help' },
    { route: '/settings', label: 'Settings', icon: 'settings-2' },
  ] as const;
}
