import { Injectable, signal } from '@angular/core';

import { environment } from '../../environments/environment';

const STORAGE_KEY = 'expenzo-cycle-start-day';
const VALID_DAYS = new Set([1, 5, 10, 15, 20, 25]);

@Injectable({ providedIn: 'root' })
export class CyclePreferenceService {
  private readonly selectedDay = signal(this.read());

  readonly day = this.selectedDay.asReadonly();

  set(day: number): void {
    if (!VALID_DAYS.has(day)) {
      return;
    }

    this.selectedDay.set(day);
    try {
      localStorage.setItem(STORAGE_KEY, day.toString());
    } catch {
      // The in-memory preference remains usable when storage is unavailable.
    }
  }

  private read(): number {
    try {
      const stored = Number(localStorage.getItem(STORAGE_KEY));
      return VALID_DAYS.has(stored) ? stored : environment.defaultCycleStartDay;
    } catch {
      return environment.defaultCycleStartDay;
    }
  }
}
