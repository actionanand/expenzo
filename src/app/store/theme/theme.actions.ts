import { createAction } from '@ngrx/store';

export const toggleTheme = createAction('[Theme] Toggle');
export const setDarkTheme = createAction('[Theme] Set Dark');
export const setLightTheme = createAction('[Theme] Set Light');
export const initTheme = createAction('[Theme] Init');
