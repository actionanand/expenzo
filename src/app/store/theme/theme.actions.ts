import { createAction, props } from '@ngrx/store';

export type ThemeMode = 'auto' | 'light' | 'dark';

export const setThemeMode = createAction('[Theme] Set Mode', props<{ mode: ThemeMode }>());
export const initTheme = createAction('[Theme] Init');
