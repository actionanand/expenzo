import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { CycleSelector } from '../cycle-selector/cycle-selector';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CycleSelector, LucideDynamicIcon, NgOptimizedImage, RouterLink, ThemeToggle],
  template: `
    <header class="app-header">
      <a routerLink="/" class="app-title" aria-label="Expenzo home">
        <img ngSrc="expenzo.png" width="32" height="32" alt="" priority />
        <span>Expenzo</span>
      </a>
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
        <a
          routerLink="/settings"
          class="nav-link settings-link"
          aria-label="Settings"
          title="Settings"
        >
          <svg lucideIcon="settings-2" aria-hidden="true"></svg>
        </a>
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
    { route: '/transactions', label: 'Transactions', icon: 'arrow-left-right' },
    { route: '/stockpile', label: 'Stockpile wishlist', icon: 'shopping-basket' },
    { route: '/checklist', label: 'Checklist', icon: 'circle-check' },
    { route: '/help', label: 'Help and setup guide', icon: 'circle-help' },
  ] as const;
}
