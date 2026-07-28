import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-mobile-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-navigation" aria-label="Primary navigation">
      @for (item of items; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.exact }"
          ariaCurrentWhenActive="page"
        >
          <svg [lucideIcon]="item.icon" aria-hidden="true"></svg>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
  styleUrl: './mobile-navigation.scss',
})
export class MobileNavigation {
  protected readonly items = [
    { route: '/', label: 'Home', icon: 'house', exact: true },
    { route: '/stockpile', label: 'Stockpile', icon: 'shopping-basket', exact: false },
    { route: '/checklist', label: 'Checklist', icon: 'circle-check', exact: false },
    { route: '/help', label: 'Help', icon: 'circle-help', exact: false },
    { route: '/settings', label: 'Settings', icon: 'settings-2', exact: false },
  ] as const;
}
