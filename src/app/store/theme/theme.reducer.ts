import { createReducer, on } from '@ngrx/store';

import { ThemeMode, setThemeMode } from './theme.actions';

export interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'auto',
};

export const themeReducer = createReducer(
  initialState,
  on(setThemeMode, (_state, { mode }) => ({ mode })),
);
