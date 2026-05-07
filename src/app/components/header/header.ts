import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { CycleSelector } from '../cycle-selector/cycle-selector';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggle, CycleSelector],
  template: `
    <header class="app-header">
      <h1 class="app-title">Expenzo</h1>
      <div class="header-actions">
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
