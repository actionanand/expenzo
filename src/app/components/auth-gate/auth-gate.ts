import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-gate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!authService.isAuthenticated()) {
      <div class="auth-overlay">
        <div class="auth-card" [class.wobble]="wobble()" (animationend)="wobble.set(false)">
          <div class="auth-icon">🔒</div>
          <h1 class="auth-title">Expenzo</h1>
          <p class="auth-subtitle">Enter password to continue</p>
          <form (submit)="onSubmit($event)">
            <div class="input-group">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                class="auth-input"
                [class.error]="errorMsg()"
                placeholder="Password"
                [value]="password()"
                (input)="onInput($event)"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="eye-btn"
                (click)="toggleShowPassword()"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
              >
                @if (showPassword()) {
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                } @else {
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
              </button>
            </div>
            @if (errorMsg()) {
              <p class="error-msg" role="alert">{{ errorMsg() }}</p>
            }
            @if (successMsg()) {
              <p class="success-msg" role="status">{{ successMsg() }}</p>
            }
            <button type="submit" class="auth-submit" [disabled]="loading()">
              {{ loading() ? 'Verifying...' : 'Unlock' }}
            </button>
          </form>
        </div>
      </div>
    }
  `,
  styleUrl: './auth-gate.scss',
})
export class AuthGate {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly successMsg = signal('');
  protected readonly wobble = signal(false);
  protected readonly loading = signal(false);

  protected toggleShowPassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  protected onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.password.set(val);
    if (this.errorMsg()) {
      this.errorMsg.set('');
    }
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const pw = this.password();
    if (!pw.trim()) {
      this.errorMsg.set('Please enter a password');
      this.wobble.set(true);
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const success = await this.authService.login(pw);

    if (success) {
      this.successMsg.set('Access granted!');
      this.loading.set(false);
      const targetUrl = this.authService.redirectUrl;
      this.authService.redirectUrl = null;
      if (targetUrl) {
        this.router.navigateByUrl(targetUrl);
      }
    } else {
      this.errorMsg.set('Wrong password. Try again.');
      this.wobble.set(true);
      this.loading.set(false);
      this.password.set('');
    }
  }
}
