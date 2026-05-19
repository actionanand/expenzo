import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { initTheme } from './store/theme/theme.actions';
import { AuthGate } from './components/auth-gate/auth-gate';
import { CacheService } from './services/cache.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AuthGate],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly store = inject(Store);
  protected readonly cache = inject(CacheService);

  ngOnInit(): void {
    this.store.dispatch(initTheme());
  }
}
