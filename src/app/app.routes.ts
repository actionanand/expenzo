import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'stockpile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/stockpile/stockpile').then((m) => m.Stockpile),
  },
  {
    path: 'checklist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checklist/checklist').then((m) => m.Checklist),
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help').then((m) => m.Help),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
