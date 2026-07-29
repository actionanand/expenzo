export const LAST_DAY_OF_MONTH = -1;
export const SECOND_LAST_DAY_OF_MONTH = -2;

export const CYCLE_START_VALUES = [
  LAST_DAY_OF_MONTH,
  SECOND_LAST_DAY_OF_MONTH,
  1,
  2,
  3,
  5,
  10,
  15,
  20,
  25,
  28,
] as const;

export function isValidCycleStart(value: number): boolean {
  return CYCLE_START_VALUES.some((day) => day === value);
}

export function apiCycleStart(value: number): number {
  return value > 0 ? value : 1;
}

export function cycleStartDate(year: number, month: number, value: number): Date {
  if (value > 0) {
    return new Date(year, month, value);
  }

  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, lastDay + value + 1);
}
