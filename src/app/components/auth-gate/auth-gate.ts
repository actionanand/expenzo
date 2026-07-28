import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-gate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    @if (authService.redirectUrl()) {
      <div class="auth-overlay">
        <div class="auth-card" [class.wobble]="wobble()" (animationend)="wobble.set(false)">
          <div class="auth-icon" aria-hidden="true">
            <svg lucideIcon="lock-keyhole"></svg>
          </div>
          <h1 class="auth-title">Expenzo</h1>
          <p class="auth-subtitle">Enter password to continue</p>
          <form (submit)="onSubmit($event)">
            <input type="hidden" name="username" value="expenzo" autocomplete="username" />
            <div class="input-group">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                class="auth-input"
                [class.error]="errorMsg()"
                placeholder="Password"
                name="password"
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
                  <svg lucideIcon="eye-off" aria-hidden="true"></svg>
                } @else {
                  <svg lucideIcon="eye" aria-hidden="true"></svg>
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
      const targetUrl = this.authService.redirectUrl();
      this.authService.redirectUrl.set(null);
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
