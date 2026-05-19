import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { first, map, tap, withLatestFrom } from 'rxjs';

import { initTheme, setThemeMode, ThemeMode } from './theme.actions';
import { selectIsDark, selectThemeMode } from './theme.selectors';

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
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
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
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

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
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
          }
        });
    });
  }
}
