import {
  LAST_DAY_OF_MONTH,
  SECOND_LAST_DAY_OF_MONTH,
  apiCycleStart,
  cycleStartDate,
} from './cycle-start';

describe('cycle start helpers', () => {
  it('resolves the last day across different month lengths', () => {
    expect(cycleStartDate(2026, 0, LAST_DAY_OF_MONTH)).toEqual(new Date(2026, 0, 31));
    expect(cycleStartDate(2026, 1, LAST_DAY_OF_MONTH)).toEqual(new Date(2026, 1, 28));
    expect(cycleStartDate(2028, 1, LAST_DAY_OF_MONTH)).toEqual(new Date(2028, 1, 29));
  });

  it('resolves the second-last day across different month lengths', () => {
    expect(cycleStartDate(2026, 0, SECOND_LAST_DAY_OF_MONTH)).toEqual(new Date(2026, 0, 30));
    expect(cycleStartDate(2026, 1, SECOND_LAST_DAY_OF_MONTH)).toEqual(new Date(2026, 1, 27));
  });

  it('keeps fixed cycle days unchanged', () => {
    expect(cycleStartDate(2026, 1, 28)).toEqual(new Date(2026, 1, 28));
  });

  it('uses a safe API day for locally calculated month-end cycles', () => {
    expect(apiCycleStart(LAST_DAY_OF_MONTH)).toBe(1);
    expect(apiCycleStart(25)).toBe(25);
  });
});
