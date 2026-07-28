import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { Store } from '@ngrx/store';

import { setThemeMode, ThemeMode } from '../../store/theme/theme.actions';
import { selectThemeMode } from '../../store/theme/theme.selectors';

const MODE_CYCLE: ThemeMode[] = ['auto', 'light', 'dark'];

const MODE_LABELS: Record<ThemeMode, string> = {
  auto: 'Auto theme (follows system)',
  light: 'Light theme',
  dark: 'Dark theme',
};

const MODE_ICONS: Record<ThemeMode, string> = {
  auto: 'monitor-cog',
  light: 'sun',
  dark: 'moon-star',
};

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, LucideDynamicIcon],
  template: `
    @if (themeMode$ | async; as mode) {
      <button
        class="theme-toggle"
        (click)="cycleTheme(mode)"
        [attr.aria-label]="labels[mode]"
        [attr.title]="labels[mode]"
        type="button"
      >
        <svg class="toggle-icon" [lucideIcon]="icons[mode]" aria-hidden="true"></svg>
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
    const index = MODE_CYCLE.indexOf(current);
    const next = MODE_CYCLE[(index + 1) % MODE_CYCLE.length];
    this.store.dispatch(setThemeMode({ mode: next }));
  }
}
