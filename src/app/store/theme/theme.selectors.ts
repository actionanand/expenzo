import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ThemeState } from './theme.reducer';

export const selectThemeState = createFeatureSelector<ThemeState>('theme');

export const selectThemeMode = createSelector(selectThemeState, (state) => state.mode);

export const selectIsDark = createSelector(selectThemeState, (state) => {
  if (state.mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return state.mode === 'dark';
});
