import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <div class="not-found-icon">404</div>
      <h1 class="not-found-title">Page Not Found</h1>
      <p class="not-found-msg">The page you're looking for doesn't exist.</p>
      <a routerLink="/" class="home-btn">Go to Dashboard</a>
    </div>
  `,
  styles: [
    `
      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 1rem;
        padding: 2rem;
        background: var(--color-background);
        text-align: center;
      }

      .not-found-icon {
        font-size: 5rem;
        font-weight: 800;
        color: var(--color-primary);
        opacity: 0.3;
        line-height: 1;
      }

      .not-found-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
      }

      .not-found-msg {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
      }

      .home-btn {
        margin-top: 0.5rem;
        padding: 0.625rem 1.5rem;
        background: var(--color-primary);
        color: #fff;
        border-radius: var(--radius-sm);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.875rem;
        transition: opacity 0.15s ease;

        &:hover {
          opacity: 0.9;
        }

        &:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 3px;
        }
      }
    `,
  ],
})
export class NotFound {}
