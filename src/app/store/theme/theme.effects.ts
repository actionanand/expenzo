import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { first, map, tap, withLatestFrom } from 'rxjs';

import { initTheme, setThemeMode, ThemeMode } from './theme.actions';
import { selectIsDark, selectThemeMode } from './theme.selectors';
import '../../models/native-bridge.model';

@Injectable()
export class ThemeEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyTheme$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setThemeMode),
        withLatestFrom(this.store.select(selectIsDark)),
        tap(([{ mode }, isDark]) => {
          this.applyTheme(isDark);
          localStorage.setItem('expenzo-theme', mode);
        }),
      ),
    { dispatch: false },
  );

  readonly initTheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(initTheme),
      map(() => {
        const saved = localStorage.getItem('expenzo-theme') as ThemeMode | null;
        const mode: ThemeMode = saved === 'light' || saved === 'dark' ? saved : 'auto';

        // Apply immediately
        const isDark =
          mode === 'auto'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : mode === 'dark';
        this.applyTheme(isDark);

        // Listen for system theme changes (for auto mode)
        this.listenSystemTheme();

        return setThemeMode({ mode });
      }),
    ),
  );

  private listenSystemTheme(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.store
        .select(selectThemeMode)
        .pipe(first())
        .subscribe((mode) => {
          if (mode === 'auto') {
            this.applyTheme(e.matches);
          }
        });
    });
  }

  private applyTheme(isDark: boolean): void {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    const background = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg')
      .trim();
    if (background) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    }
    window.ExpenzoSystemBars?.setDarkMode(isDark);
  }
}
