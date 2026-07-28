import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  LucideCalendarDays,
  LucideChartNoAxesCombined,
  LucideChevronDown,
  LucideChevronRight,
  LucideCircleCheck,
  LucideCircleHelp,
  LucideEye,
  LucideEyeOff,
  LucideFileSpreadsheet,
  LucideFileText,
  LucideFingerprint,
  LucideGauge,
  LucideHouse,
  LucideKeyRound,
  LucideLockKeyhole,
  LucideMonitorCog,
  LucideMoonStar,
  LucideSettings2,
  LucideShieldCheck,
  LucideShieldOff,
  LucideShoppingBasket,
  LucideSun,
  LucideTrendingUp,
  LucideUnlock,
  LucideX,
  provideLucideIcons,
} from '@lucide/angular';

import { routes } from './app.routes';
import { themeReducer } from './store/theme/theme.reducer';
import { ThemeEffects } from './store/theme/theme.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(),
    provideStore({ theme: themeReducer }),
    provideEffects([ThemeEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideLucideIcons(
      LucideCalendarDays,
      LucideChartNoAxesCombined,
      LucideChevronDown,
      LucideChevronRight,
      LucideCircleCheck,
      LucideCircleHelp,
      LucideEye,
      LucideEyeOff,
      LucideFileSpreadsheet,
      LucideFileText,
      LucideFingerprint,
      LucideGauge,
      LucideHouse,
      LucideKeyRound,
      LucideLockKeyhole,
      LucideMonitorCog,
      LucideMoonStar,
      LucideSettings2,
      LucideShieldCheck,
      LucideShieldOff,
      LucideShoppingBasket,
      LucideSun,
      LucideTrendingUp,
      LucideUnlock,
      LucideX,
    ),
  ],
};
