import { TestBed } from '@angular/core/testing';

import {
  COUNTRY_CURRENCY_OPTIONS,
  DISPLAY_CURRENCY_CODES,
  CurrencyPreferencesService,
  countryOptionForCurrency,
  currencySymbol,
} from './currency-preferences.service';

describe('CurrencyPreferencesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('defaults to India and INR', () => {
    const service = TestBed.inject(CurrencyPreferencesService);

    expect(service.countryCode()).toBe('IN');
    expect(service.currencyCode()).toBe('INR');
    expect(service.format(1000)).toContain('₹');
  });

  it('contains only valid ISO-shaped country and currency codes', () => {
    expect(COUNTRY_CURRENCY_OPTIONS.every((option) => /^[A-Z]{2}$/.test(option.countryCode))).toBe(
      true,
    );
    expect(DISPLAY_CURRENCY_CODES.every((currencyCode) => /^[A-Z]{3}$/.test(currencyCode))).toBe(
      true,
    );
    expect(
      COUNTRY_CURRENCY_OPTIONS.find((option) => option.countryCode === 'LB')?.currencyCode,
    ).toBe('LBP');
  });

  it('updates currency when the country changes', () => {
    const service = TestBed.inject(CurrencyPreferencesService);

    service.setCountry('GB');

    expect(service.countryCode()).toBe('GB');
    expect(service.currencyCode()).toBe('GBP');
    expect(service.format(1000)).toContain('£');
  });

  it('updates country when the currency changes', () => {
    const service = TestBed.inject(CurrencyPreferencesService);

    service.setCurrency('USD');

    expect(service.countryCode()).toBe('US');
    expect(service.currencyCode()).toBe('USD');
  });

  it('keeps a country that already uses the selected currency', () => {
    expect(countryOptionForCurrency('USD', 'EC')?.countryCode).toBe('EC');
    expect(countryOptionForCurrency('EUR', 'FR')?.countryCode).toBe('FR');
  });

  it('persists the selection in local storage', () => {
    const service = TestBed.inject(CurrencyPreferencesService);
    service.setCountry('JP');
    TestBed.resetTestingModule();

    const restored = TestBed.inject(CurrencyPreferencesService);
    expect(restored.countryCode()).toBe('JP');
    expect(restored.currencyCode()).toBe('JPY');
  });

  it('falls back to a currency abbreviation when Intl has no distinct symbol', () => {
    const symbol = currencySymbol('XAF', 'CM');
    expect(symbol.length).toBeGreaterThan(0);
  });
});
