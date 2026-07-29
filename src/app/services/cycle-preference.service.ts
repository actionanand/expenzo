import { Injectable, signal } from '@angular/core';

import { environment } from '../../environments/environment';
import { isValidCycleStart } from '../utils/cycle-start';

const STORAGE_KEY = 'expenzo-cycle-start-day';

@Injectable({ providedIn: 'root' })
export class CyclePreferenceService {
  private readonly selectedDay = signal(this.read());

  readonly day = this.selectedDay.asReadonly();

  set(day: number): void {
    if (!isValidCycleStart(day)) {
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
      return isValidCycleStart(stored) ? stored : environment.defaultCycleStartDay;
    } catch {
      return environment.defaultCycleStartDay;
    }
  }
}
