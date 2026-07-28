import { Injectable } from '@angular/core';

export type HapticFeedbackStyle = 'selection' | 'error';

@Injectable({ providedIn: 'root' })
export class HapticFeedbackService {
  trigger(style: HapticFeedbackStyle): void {
    try {
      window.ExpenzoNative?.hapticFeedback(style);
    } catch {
      // Haptics are optional; web and unsupported Android devices continue normally.
    }
  }
}
