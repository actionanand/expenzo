import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';

import { AppLockService } from '../../services/app-lock.service';
import { AuthService } from '../../services/auth.service';
import { SecuritySettingsService } from '../../services/security-settings.service';
import { SecurityService } from '../../services/security.service';
import { HapticFeedbackService } from '../../services/haptic-feedback.service';

@Component({
  selector: 'app-lock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, NgOptimizedImage, ReactiveFormsModule],
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(window:expenzo-back-button)': 'onNativeBack($event)',
  },
  template: `
    @if (lock.locked()) {
      <main class="lock-overlay">
        <section
          class="lock-panel"
          [class.wobble]="pinShake()"
          aria-labelledby="unlock-title"
          [attr.inert]="resetOpen() ? '' : null"
          (animationend)="pinShake.set(false)"
        >
          <img ngSrc="expenzo.png" width="72" height="72" alt="" priority />
          <div>
            <p class="eyebrow">Welcome back</p>
            <h1 id="unlock-title">Unlock Expenzo</h1>
            <p class="subtitle">Enter your PIN to access your financial data.</p>
          </div>

          <form data-testid="pin-unlock-form" [formGroup]="unlockForm" (ngSubmit)="unlockWithPin()">
            <label for="unlock-pin">PIN</label>
            <input
              id="unlock-pin"
              formControlName="pin"
              [class.error]="error()"
              [attr.aria-invalid]="error() ? true : null"
              type="password"
              inputmode="numeric"
              autocomplete="current-password"
              maxlength="8"
              (input)="clearPinError()"
            />
            @if (error()) {
              <p class="form-error" role="alert">{{ error() }}</p>
            }
            <button class="primary-button" type="submit" [disabled]="verifying()">
              <svg lucideIcon="unlock" aria-hidden="true"></svg>
              {{ verifying() ? 'Checking...' : 'Unlock' }}
            </button>
          </form>

          @if (settings.settings().biometricEnabled && security.biometricAvailable) {
            <button class="biometric-button" type="button" (click)="security.requestBiometric()">
              <svg lucideIcon="fingerprint" aria-hidden="true"></svg>
              Use fingerprint
            </button>
          }

          <button #resetTrigger class="reset-pin-button" type="button" (click)="openReset()">
            Reset PIN
          </button>
        </section>

        @if (resetOpen()) {
          <div class="reset-backdrop">
            <section
              class="reset-dialog"
              [class.wobble]="resetShake()"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-pin-title"
              (animationend)="resetShake.set(false)"
            >
              <header>
                <div>
                  <p class="eyebrow">PIN recovery</p>
                  <h2 id="reset-pin-title">
                    {{ resetStep() === 'master' ? 'Verify master password' : 'Create a new PIN' }}
                  </h2>
                </div>
                <button type="button" aria-label="Close PIN reset" (click)="closeReset()">
                  <svg lucideIcon="x" aria-hidden="true"></svg>
                </button>
              </header>

              @if (resetStep() === 'master') {
                <p class="dialog-copy">
                  Enter the master password used to log in to Expenzo. Saved login access is not
                  used for this verification.
                </p>
                <form
                  data-testid="master-password-form"
                  [formGroup]="masterForm"
                  (ngSubmit)="verifyMasterPassword()"
                >
                  <label for="master-password">Master password</label>
                  <input
                    #masterPasswordInput
                    id="master-password"
                    formControlName="password"
                    [class.error]="resetError()"
                    [attr.aria-invalid]="resetError() ? true : null"
                    type="password"
                    autocomplete="current-password"
                    (input)="clearResetError()"
                  />
                  @if (resetError()) {
                    <p class="form-error" role="alert">{{ resetError() }}</p>
                  }
                  <footer>
                    <button class="dialog-secondary" type="button" (click)="closeReset()">
                      Cancel
                    </button>
                    <button class="dialog-primary" type="submit" [disabled]="resetBusy()">
                      {{ resetBusy() ? 'Verifying...' : 'Continue' }}
                    </button>
                  </footer>
                </form>
              } @else {
                <p class="dialog-copy">Master password verified. Choose a new 4 to 8 digit PIN.</p>
                <form
                  data-testid="pin-reset-form"
                  [formGroup]="resetPinForm"
                  (ngSubmit)="saveResetPin()"
                >
                  <label for="reset-new-pin">New PIN</label>
                  <input
                    #newPinInput
                    id="reset-new-pin"
                    formControlName="pin"
                    [class.error]="resetError()"
                    [attr.aria-invalid]="resetError() ? true : null"
                    type="password"
                    inputmode="numeric"
                    autocomplete="new-password"
                    minlength="4"
                    maxlength="8"
                    (input)="clearResetError()"
                  />
                  <label for="reset-confirm-pin">Confirm PIN</label>
                  <input
                    id="reset-confirm-pin"
                    formControlName="confirmation"
                    [class.error]="resetError()"
                    [attr.aria-invalid]="resetError() ? true : null"
                    type="password"
                    inputmode="numeric"
                    autocomplete="new-password"
                    minlength="4"
                    maxlength="8"
                    (input)="clearResetError()"
                  />
                  @if (resetError()) {
                    <p class="form-error" role="alert">{{ resetError() }}</p>
                  }
                  <footer>
                    <button class="dialog-secondary" type="button" (click)="closeReset()">
                      Cancel
                    </button>
                    <button class="dialog-primary" type="submit" [disabled]="resetBusy()">
                      {{ resetBusy() ? 'Saving...' : 'Reset PIN' }}
                    </button>
                  </footer>
                </form>
              }
            </section>
          </div>
        }
      </main>
    }
  `,
  styleUrl: './app-lock.scss',
})
export class AppLock {
  protected readonly lock = inject(AppLockService);
  protected readonly settings = inject(SecuritySettingsService);
  protected readonly security = inject(SecurityService);
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly haptics = inject(HapticFeedbackService);
  protected readonly unlockForm = this.formBuilder.nonNullable.group({
    pin: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
  });
  protected readonly error = signal('');
  protected readonly verifying = signal(false);
  protected readonly pinShake = signal(false);
  protected readonly resetOpen = signal(false);
  protected readonly resetStep = signal<'master' | 'pin'>('master');
  protected readonly resetError = signal('');
  protected readonly resetBusy = signal(false);
  protected readonly resetShake = signal(false);
  protected readonly masterForm = this.formBuilder.nonNullable.group({
    password: ['', Validators.required],
  });
  protected readonly resetPinForm = this.formBuilder.nonNullable.group({
    pin: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
    confirmation: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
  });
  private readonly resetTrigger = viewChild<ElementRef<HTMLButtonElement>>('resetTrigger');
  private readonly masterPasswordInput =
    viewChild<ElementRef<HTMLInputElement>>('masterPasswordInput');
  private readonly newPinInput = viewChild<ElementRef<HTMLInputElement>>('newPinInput');

  constructor() {
    afterNextRender(() => {
      if (
        this.lock.locked() &&
        this.settings.settings().biometricEnabled &&
        this.security.biometricAvailable
      ) {
        this.security.requestBiometric();
      }
    });
  }

  protected async unlockWithPin(): Promise<void> {
    if (this.unlockForm.invalid) {
      this.showPinError('Enter your 4 to 8 digit PIN.');
      return;
    }

    this.verifying.set(true);
    try {
      const valid = await this.security.verifyPin(
        this.unlockForm.controls.pin.value,
        this.settings.settings(),
      );
      if (!valid) {
        this.showPinError('Wrong PIN. Try again.');
        this.unlockForm.reset({ pin: '' });
        return;
      }

      this.unlockForm.reset({ pin: '' });
      this.clearPinError();
      this.lock.unlock();
    } catch {
      this.showPinError('PIN verification failed. Please try again.');
    } finally {
      this.verifying.set(false);
    }
  }

  protected openReset(): void {
    this.resetStep.set('master');
    this.clearResetError();
    this.masterForm.reset({ password: '' });
    this.resetPinForm.reset({ pin: '', confirmation: '' });
    this.resetOpen.set(true);
    window.setTimeout(() => this.masterPasswordInput()?.nativeElement.focus());
  }

  protected closeReset(restoreFocus = true): void {
    this.resetOpen.set(false);
    this.resetStep.set('master');
    this.clearResetError();
    this.resetBusy.set(false);
    this.masterForm.reset({ password: '' });
    this.resetPinForm.reset({ pin: '', confirmation: '' });
    if (restoreFocus) {
      window.setTimeout(() => this.resetTrigger()?.nativeElement.focus());
    }
  }

  protected onEscape(): void {
    if (this.resetOpen()) {
      this.closeReset();
    }
  }

  protected onNativeBack(event: Event): void {
    if (this.resetOpen()) {
      event.preventDefault();
      this.closeReset();
    }
  }

  protected async verifyMasterPassword(): Promise<void> {
    if (this.masterForm.invalid) {
      this.showResetError('Enter your master password.');
      return;
    }

    this.resetBusy.set(true);
    try {
      const valid = await this.auth.verifyPassword(this.masterForm.controls.password.value);
      if (!valid) {
        this.showResetError('Incorrect master password.');
        this.masterForm.reset({ password: '' });
        return;
      }

      this.masterForm.reset({ password: '' });
      this.clearResetError();
      this.resetStep.set('pin');
      window.setTimeout(() => this.newPinInput()?.nativeElement.focus());
    } catch {
      this.showResetError('Password verification failed. Please try again.');
    } finally {
      this.resetBusy.set(false);
    }
  }

  protected async saveResetPin(): Promise<void> {
    const { pin, confirmation } = this.resetPinForm.getRawValue();
    if (this.resetPinForm.invalid || pin !== confirmation) {
      this.showResetError('Use 4 to 8 digits and enter the same PIN twice.');
      return;
    }

    this.resetBusy.set(true);
    try {
      const credentials = await this.security.createPin(pin);
      this.security.disableBiometric();
      this.settings.update({
        pinEnabled: true,
        biometricEnabled: false,
        ...credentials,
      });
      this.closeReset(false);
      this.unlockForm.reset({ pin: '' });
      this.clearPinError();
      this.lock.unlock();
    } catch {
      this.resetBusy.set(false);
      this.showResetError('PIN reset failed. Please try again.');
    }
  }

  protected clearPinError(): void {
    this.error.set('');
    this.pinShake.set(false);
  }

  protected clearResetError(): void {
    this.resetError.set('');
    this.resetShake.set(false);
  }

  private showPinError(message: string): void {
    this.error.set(message);
    this.haptics.trigger('error');
    this.pinShake.set(false);
    window.setTimeout(() => this.pinShake.set(true));
  }

  private showResetError(message: string): void {
    this.resetError.set(message);
    this.haptics.trigger('error');
    this.resetShake.set(false);
    window.setTimeout(() => this.resetShake.set(true));
  }
}
