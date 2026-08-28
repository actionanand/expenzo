import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import {
  AppSelectOption,
  AppSelectPicker,
} from '../../components/app-select-picker/app-select-picker';
import { AppLockService } from '../../services/app-lock.service';
import {
  COUNTRY_CURRENCY_OPTIONS,
  CurrencyPreferencesService,
  DISPLAY_CURRENCY_CODES,
  currencyLabel,
  currencySymbol,
} from '../../services/currency-preferences.service';
import { SecuritySettingsService } from '../../services/security-settings.service';
import { SecurityService } from '../../services/security.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppSelectPicker, LucideDynamicIcon, ReactiveFormsModule, RouterLink],
  host: {
    '(window:biometric-enabled)': 'onBiometricEnabled()',
    '(window:expenzo-back-button)': 'onNativeBack($event)',
  },
  template: `
    <main class="settings-backdrop">
      <section
        class="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        [attr.inert]="pinDialogOpen() || confirmRemove() ? '' : null"
      >
        <header class="page-heading">
          <div>
            <p>Preferences</p>
            <h1 id="settings-title">Settings</h1>
            <span>Manage local security and device behavior.</span>
          </div>
          <a routerLink="/" class="close-button" aria-label="Close settings">
            <svg lucideIcon="x" aria-hidden="true"></svg>
          </a>
        </header>

        <div class="settings-body">
          <section class="settings-section" aria-labelledby="currency-title">
            <header>
              <span class="section-icon" aria-hidden="true">
                <svg lucideIcon="coins"></svg>
              </span>
              <div>
                <h2 id="currency-title">Country & currency</h2>
                <p>Choose how amounts appear. Values are not converted.</p>
              </div>
            </header>

            <div class="setting-rows currency-rows">
              <div class="setting-row picker-row">
                <span>
                  <strong>Country or region</strong>
                  <small>Sets the usual currency and number format</small>
                </span>
                <app-select-picker
                  label="Country or region"
                  sheetTitle="Choose country or region"
                  searchPlaceholder="Search country or currency"
                  [searchable]="true"
                  [options]="countryOptions"
                  [value]="currency.countryCode()"
                  (valueChange)="changeCountry($event)"
                />
              </div>

              <div class="setting-row picker-row">
                <span>
                  <strong>Display currency</strong>
                  <small>Changes symbols only, without exchange-rate conversion</small>
                </span>
                <app-select-picker
                  label="Display currency"
                  sheetTitle="Choose display currency"
                  searchPlaceholder="Search currency name or code"
                  [searchable]="true"
                  [options]="currencyOptions"
                  [value]="currency.currencyCode()"
                  (valueChange)="changeCurrency($event)"
                />
              </div>
            </div>
          </section>

          <section class="settings-section" aria-labelledby="security-title">
            <header>
              <span class="section-icon" aria-hidden="true">
                <svg lucideIcon="shield-check"></svg>
              </span>
              <div>
                <h2 id="security-title">Security</h2>
                <p>Protect Expenzo locally with a PIN and Android fingerprint unlock.</p>
              </div>
            </header>

            <div class="setting-rows">
              <div class="setting-row">
                <span>
                  <strong>PIN protection</strong>
                  <small>{{ settings.settings().pinEnabled ? 'Enabled' : 'Not configured' }}</small>
                </span>
                <button class="action-button primary" type="button" (click)="openPinDialog()">
                  <svg lucideIcon="key-round" aria-hidden="true"></svg>
                  {{ settings.settings().pinEnabled ? 'Change PIN' : 'Enable PIN' }}
                </button>
              </div>

              <div class="setting-row">
                <span>
                  <strong>Fingerprint unlock</strong>
                  <small>{{ biometricDescription() }}</small>
                </span>
                <button
                  class="switch"
                  type="button"
                  role="switch"
                  aria-label="Fingerprint unlock"
                  [disabled]="!security.biometricAvailable || !settings.settings().pinEnabled"
                  [attr.aria-checked]="settings.settings().biometricEnabled"
                  [class.on]="settings.settings().biometricEnabled"
                  (click)="toggleBiometric()"
                >
                  <span></span>
                </button>
              </div>

              <div class="setting-row select-row">
                <span>
                  <strong>Auto-lock</strong>
                  <small>After Expenzo enters the background</small>
                </span>
                <app-select-picker
                  sheetTitle="Auto-lock timing"
                  [options]="autoLockOptions"
                  [value]="autoLockValue()"
                  [compact]="true"
                  [disabled]="!settings.settings().pinEnabled"
                  (valueChange)="changeAutoLock($event)"
                />
              </div>

              <div class="setting-row">
                <span>
                  <strong>Lock in background</strong>
                  <small>Protect data when switching apps</small>
                </span>
                <button
                  class="switch"
                  type="button"
                  role="switch"
                  aria-label="Lock in background"
                  [disabled]="!settings.settings().pinEnabled"
                  [attr.aria-checked]="settings.settings().lockInBackground"
                  [class.on]="settings.settings().lockInBackground"
                  (click)="toggleLockInBackground()"
                >
                  <span></span>
                </button>
              </div>
            </div>

            @if (settings.settings().pinEnabled) {
              <div class="security-actions">
                <button class="action-button" type="button" (click)="lock.lockNow()">
                  <svg lucideIcon="lock-keyhole" aria-hidden="true"></svg>
                  Lock now
                </button>
                <button
                  class="action-button danger"
                  type="button"
                  (click)="confirmRemove.set(true)"
                >
                  <svg lucideIcon="shield-off" aria-hidden="true"></svg>
                  Remove PIN
                </button>
              </div>
            }
          </section>
        </div>
      </section>

      @if (message()) {
        <p class="settings-message" role="status">{{ message() }}</p>
      }
    </main>

    @if (pinDialogOpen()) {
      <div class="dialog-backdrop">
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="pin-dialog-title">
          <header>
            <div>
              <p>Device security</p>
              <h2 id="pin-dialog-title">
                {{ settings.settings().pinEnabled ? 'Change PIN' : 'Create a PIN' }}
              </h2>
            </div>
            <button type="button" aria-label="Close PIN dialog" (click)="closePinDialog()">
              <svg lucideIcon="x" aria-hidden="true"></svg>
            </button>
          </header>
          <p class="warning">
            There is no PIN recovery. Forgetting it can prevent access until the app data is
            cleared.
          </p>
          <form [formGroup]="pinForm" (ngSubmit)="savePin()">
            <label>
              <span>New PIN</span>
              <input
                formControlName="pin"
                type="password"
                inputmode="numeric"
                autocomplete="new-password"
                minlength="4"
                maxlength="8"
              />
            </label>
            <label>
              <span>Confirm PIN</span>
              <input
                formControlName="confirmation"
                type="password"
                inputmode="numeric"
                autocomplete="new-password"
                minlength="4"
                maxlength="8"
              />
            </label>
            @if (formError()) {
              <p class="form-error" role="alert">{{ formError() }}</p>
            }
            <footer>
              <button class="action-button" type="button" (click)="closePinDialog()">Cancel</button>
              <button class="action-button primary" type="submit" [disabled]="savingPin()">
                {{ savingPin() ? 'Saving...' : 'Save PIN' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    }

    @if (confirmRemove()) {
      <div class="dialog-backdrop">
        <section
          class="dialog compact-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="remove-pin-title"
        >
          <header>
            <div>
              <p>Device security</p>
              <h2 id="remove-pin-title">Remove PIN protection?</h2>
            </div>
          </header>
          <p>Fingerprint unlock will also be disabled.</p>
          <footer>
            <button class="action-button" type="button" (click)="confirmRemove.set(false)">
              Cancel
            </button>
            <button class="action-button danger" type="button" (click)="removePin()">
              Remove PIN
            </button>
          </footer>
        </section>
      </div>
    }
  `,
  styleUrl: './settings.scss',
})
export class Settings {
  protected readonly settings = inject(SecuritySettingsService);
  protected readonly security = inject(SecurityService);
  protected readonly lock = inject(AppLockService);
  protected readonly currency = inject(CurrencyPreferencesService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly pinDialogOpen = signal(false);
  protected readonly confirmRemove = signal(false);
  protected readonly formError = signal('');
  protected readonly savingPin = signal(false);
  protected readonly message = signal('');
  protected readonly countryOptions: readonly AppSelectOption[] = COUNTRY_CURRENCY_OPTIONS.map(
    (option) => ({
      value: option.countryCode,
      label: option.countryName,
      detail: `${option.currencyCode} · ${currencyLabel(option.currencyCode)}`,
    }),
  );
  protected readonly currencyOptions: readonly AppSelectOption[] = DISPLAY_CURRENCY_CODES.map(
    (currencyCode) => ({
      value: currencyCode,
      label: `${currencyLabel(currencyCode)} (${currencyCode})`,
      detail: currencySymbol(currencyCode, 'US'),
    }),
  );
  protected readonly pinForm = this.formBuilder.nonNullable.group({
    pin: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
    confirmation: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
  });

  protected onNativeBack(event: Event): void {
    if (this.pinDialogOpen()) {
      event.preventDefault();
      this.closePinDialog();
      return;
    }

    if (this.confirmRemove()) {
      event.preventDefault();
      this.confirmRemove.set(false);
    }
  }
  protected readonly autoLockOptions: readonly AppSelectOption[] = [
    { value: '0', label: 'Immediately' },
    { value: '1', label: 'After 1 minute' },
    { value: '5', label: 'After 5 minutes' },
    { value: '15', label: 'After 15 minutes' },
    { value: '30', label: 'After 30 minutes' },
    { value: 'never', label: 'Never' },
  ];
  protected readonly autoLockValue = computed(() => {
    const value = this.settings.settings().autoLockMinutes;
    return value === null ? 'never' : value.toString();
  });
  protected readonly biometricDescription = computed(() => {
    if (!this.security.biometricAvailable) {
      return 'Available in the Android app';
    }
    if (!this.settings.settings().pinEnabled) {
      return 'Create a PIN first';
    }
    return this.settings.settings().biometricEnabled
      ? 'Enabled with PIN fallback'
      : 'Use your enrolled fingerprint';
  });

  protected openPinDialog(): void {
    this.formError.set('');
    this.pinForm.reset({ pin: '', confirmation: '' });
    this.pinDialogOpen.set(true);
  }

  protected closePinDialog(): void {
    this.pinDialogOpen.set(false);
    this.formError.set('');
  }

  protected async savePin(): Promise<void> {
    const { pin, confirmation } = this.pinForm.getRawValue();
    if (this.pinForm.invalid || pin !== confirmation) {
      this.formError.set('Use 4 to 8 digits and enter the same PIN twice.');
      return;
    }

    this.savingPin.set(true);
    try {
      const credentials = await this.security.createPin(pin);
      if (this.settings.settings().biometricEnabled) {
        this.security.disableBiometric();
      }
      this.settings.update({
        pinEnabled: true,
        biometricEnabled: false,
        ...credentials,
      });
      this.closePinDialog();
      this.showMessage('PIN protection enabled.');
    } catch {
      this.formError.set('PIN setup failed. Please try again.');
    } finally {
      this.savingPin.set(false);
    }
  }

  protected toggleBiometric(): void {
    const current = this.settings.settings();
    if (!current.pinEnabled || !current.pinVerifier || !this.security.biometricAvailable) {
      return;
    }

    if (current.biometricEnabled) {
      this.security.disableBiometric();
      this.settings.update({ biometricEnabled: false });
      this.showMessage('Fingerprint unlock disabled.');
      return;
    }

    if (this.security.enableBiometric(current.pinVerifier)) {
      this.showMessage('Confirm your fingerprint in the Android prompt.');
    }
  }

  protected onBiometricEnabled(): void {
    this.settings.update({ biometricEnabled: true });
    this.showMessage('Fingerprint unlock enabled.');
  }

  protected changeAutoLock(value: string): void {
    this.settings.update({ autoLockMinutes: value === 'never' ? null : Number(value) });
  }

  protected changeCountry(countryCode: string): void {
    this.currency.setCountry(countryCode);
    this.showMessage(`Display changed to ${currencyLabel(this.currency.currencyCode())}.`);
  }

  protected changeCurrency(currencyCode: string): void {
    this.currency.setCurrency(currencyCode);
    this.showMessage(`Display changed to ${currencyLabel(this.currency.currencyCode())}.`);
  }

  protected toggleLockInBackground(): void {
    this.settings.update({
      lockInBackground: !this.settings.settings().lockInBackground,
    });
  }

  protected removePin(): void {
    this.security.disableBiometric();
    this.settings.removePin();
    this.confirmRemove.set(false);
    this.showMessage('PIN protection removed.');
  }

  private showMessage(value: string): void {
    this.message.set(value);
    window.setTimeout(() => {
      if (this.message() === value) {
        this.message.set('');
      }
    }, 3500);
  }
}
