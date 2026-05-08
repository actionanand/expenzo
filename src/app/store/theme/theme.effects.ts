import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs';

import * as ThemeActions from './theme.actions';
import { selectIsDark } from './theme.selectors';

@Injectable()
export class ThemeEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyTheme$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ThemeActions.toggleTheme, ThemeActions.setDarkTheme, ThemeActions.setLightTheme),
        withLatestFrom(this.store.select(selectIsDark)),
        tap(([, isDark]) => {
          document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
          localStorage.setItem('expenzo-theme', isDark ? 'dark' : 'light');
        }),
      ),
    { dispatch: false },
  );

  readonly initTheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ThemeActions.initTheme),
      map(() => {
        const saved = localStorage.getItem('expenzo-theme');
        if (saved === 'dark') {
          return ThemeActions.setDarkTheme();
        }
        return ThemeActions.setLightTheme();
      }),
    ),
  );
}
