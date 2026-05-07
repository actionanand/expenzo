import { Injectable, signal } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_KEY = 'expenzo_auth';

  readonly isAuthenticated = signal(this.checkStoredAuth());

  redirectUrl: string | null = null;

  async login(password: string): Promise<boolean> {
    const hash = await this.sha1(password);
    if (hash === environment.passwordHash) {
      sessionStorage.setItem(this.AUTH_KEY, hash);
      this.isAuthenticated.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(this.AUTH_KEY);
    this.isAuthenticated.set(false);
  }

  private checkStoredAuth(): boolean {
    return sessionStorage.getItem(this.AUTH_KEY) === environment.passwordHash;
  }

  private async sha1(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
