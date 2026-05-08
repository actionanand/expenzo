import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';

import { toggleTheme } from '../../store/theme/theme.actions';
import { selectIsDark } from '../../store/theme/theme.selectors';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
  template: `
    <button
      class="theme-toggle"
      (click)="onToggle()"
      [attr.aria-label]="(isDark$ | async) ? 'Switch to light theme' : 'Switch to dark theme'"
      type="button"
    >
      @if (isDark$ | async) {
        <span class="toggle-icon" aria-hidden="true">&#9788;</span>
      } @else {
        <span class="toggle-icon" aria-hidden="true">&#9790;</span>
      }
    </button>
  `,
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  private readonly store = inject(Store);
  protected readonly isDark$ = this.store.select(selectIsDark);

  protected onToggle(): void {
    this.store.dispatch(toggleTheme());
  }
}
