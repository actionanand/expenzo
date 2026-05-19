import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';

import { setThemeMode, ThemeMode } from '../../store/theme/theme.actions';
import { selectThemeMode } from '../../store/theme/theme.selectors';

const MODE_CYCLE: ThemeMode[] = ['auto', 'light', 'dark'];

const MODE_LABELS: Record<ThemeMode, string> = {
  auto: 'Auto (system)',
  light: 'Light theme',
  dark: 'Dark theme',
};

const MODE_ICONS: Record<ThemeMode, string> = {
  auto: '🌗',
  light: '☀️',
  dark: '🌙',
};

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
  template: `
    @if (themeMode$ | async; as mode) {
      <button
        class="theme-toggle"
        (click)="cycleTheme(mode)"
        [attr.aria-label]="labels[mode]"
        [attr.title]="labels[mode]"
        type="button"
      >
        <span class="toggle-icon" aria-hidden="true">{{ icons[mode] }}</span>
      </button>
    }
  `,
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  private readonly store = inject(Store);
  protected readonly themeMode$ = this.store.select(selectThemeMode);
  protected readonly labels = MODE_LABELS;
  protected readonly icons = MODE_ICONS;

  protected cycleTheme(current: ThemeMode): void {
    const idx = MODE_CYCLE.indexOf(current);
    const next = MODE_CYCLE[(idx + 1) % MODE_CYCLE.length];
    this.store.dispatch(setThemeMode({ mode: next }));
  }
}
