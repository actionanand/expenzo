import { Pipe, PipeTransform, inject } from '@angular/core';

import { CurrencyPreferencesService } from '../services/currency-preferences.service';

@Pipe({
  name: 'money',
  pure: false,
})
export class MoneyPipe implements PipeTransform {
  private readonly currency = inject(CurrencyPreferencesService);

  transform(value: number | null | undefined, maximumFractionDigits = 0): string {
    return this.currency.format(value ?? 0, maximumFractionDigits);
  }
}
