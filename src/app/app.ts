import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { initTheme } from './store/theme/theme.actions';
import { AuthGate } from './components/auth-gate/auth-gate';
import { CacheService } from './services/cache.service';
import { AppLock } from './components/app-lock/app-lock';
import { AppLockService } from './services/app-lock.service';
import { MobileNavigation } from './components/mobile-navigation/mobile-navigation';
import { ColorThemeService } from './services/color-theme.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AuthGate, AppLock, MobileNavigation],
  host: {
    '(document:visibilitychange)': 'onVisibilityChange()',
    '(window:biometric-success)': 'onBiometricSuccess()',
  },
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly store = inject(Store);
  protected readonly cache = inject(CacheService);
  protected readonly lock = inject(AppLockService);
  private readonly colorTheme = inject(ColorThemeService);

  ngOnInit(): void {
    this.colorTheme.initialize();
    this.store.dispatch(initTheme());
  }

  protected onVisibilityChange(): void {
    this.lock.handleVisibilityChange();
  }

  protected onBiometricSuccess(): void {
    this.lock.unlock();
  }
}
