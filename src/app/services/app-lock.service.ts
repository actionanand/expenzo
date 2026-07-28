import { Injectable, inject, signal } from '@angular/core';

import { SecuritySettingsService } from './security-settings.service';

@Injectable({ providedIn: 'root' })
export class AppLockService {
  private readonly securitySettings = inject(SecuritySettingsService);
  private readonly state = signal(this.securitySettings.settings().pinEnabled);
  private backgroundedAt: number | null = null;

  readonly locked = this.state.asReadonly();

  lockNow(): void {
    if (this.securitySettings.settings().pinEnabled) {
      this.state.set(true);
    }
  }

  unlock(): void {
    this.backgroundedAt = null;
    this.state.set(false);
  }

  handleVisibilityChange(): void {
    const settings = this.securitySettings.settings();
    if (!settings.pinEnabled || !settings.lockInBackground || settings.autoLockMinutes === null) {
      this.backgroundedAt = null;
      return;
    }

    if (document.visibilityState === 'hidden') {
      this.backgroundedAt = Date.now();
      return;
    }

    if (this.backgroundedAt === null) {
      return;
    }

    const elapsed = Date.now() - this.backgroundedAt;
    if (elapsed >= settings.autoLockMinutes * 60_000) {
      this.lockNow();
    }
    this.backgroundedAt = null;
  }
}
