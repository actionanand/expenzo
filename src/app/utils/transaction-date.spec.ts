import { parseTransactionDate, todayInIndia, transactionTimestamp } from './transaction-date';

describe('parseTransactionDate', () => {
  it('parses Indian day-first dates', () => {
    expect(parseTransactionDate('27/07/2026')).toEqual(new Date(2026, 6, 27));
    expect(parseTransactionDate('2-8-2026')).toEqual(new Date(2026, 7, 2));
  });

  it('parses date-only ISO values as local calendar dates', () => {
    expect(parseTransactionDate('2026-07-27')).toEqual(new Date(2026, 6, 27));
  });

  it('converts full API timestamps to their Indian calendar date', () => {
    const value = '2026-06-24T19:17:14.325Z';
    expect(parseTransactionDate(value)).toEqual(new Date(2026, 5, 25));
    expect(transactionTimestamp(value)).toBe(Date.parse(value));
  });

  it('calculates today using Indian Standard Time', () => {
    expect(todayInIndia(new Date('2026-06-24T19:17:14.325Z'))).toEqual(new Date(2026, 5, 25));
  });

  it('rejects invalid calendar dates', () => {
    expect(parseTransactionDate('31/02/2026')).toBeNull();
    expect(parseTransactionDate('not-a-date')).toBeNull();
  });
});
