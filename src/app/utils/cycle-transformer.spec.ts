import { ExpenseResponse } from '../models/expense.model';
import { transformToCycles } from './cycle-transformer';

describe('transformToCycles', () => {
  it('uses the local calendar day represented by UTC API timestamps', () => {
    const response: ExpenseResponse = {
      success: true,
      isDevelopment: false,
      config: {
        cycleStartDay: 25,
        categories: [{ name: 'Travel', limit: 5000 }],
      },
      months: [
        {
          month: 'Jun-2026',
          incomeSources: [{ name: 'Salary', amount: 10000 }],
          summary: {
            totalIncome: 10000,
            totalExpense: 146,
            savings: 9854,
            shortage: 0,
            isOverBudget: false,
          },
          categorySummary: [],
          transactions: [
            {
              sno: 1,
              name: 'Boundary expense',
              category: 'Travel',
              price: 146,
              date: '2026-06-24T19:17:14.325Z',
            },
          ],
        },
        {
          month: 'Jul-2026',
          incomeSources: [{ name: 'Salary', amount: 10000 }],
          summary: {
            totalIncome: 10000,
            totalExpense: 0,
            savings: 10000,
            shortage: 0,
            isOverBudget: false,
          },
          categorySummary: [],
          transactions: [],
        },
      ],
    };

    const cycle = transformToCycles(response, 25).find(
      (item) =>
        item.cycleFrom.getFullYear() === 2026 &&
        item.cycleFrom.getMonth() === 5 &&
        item.cycleFrom.getDate() === 25,
    );

    expect(cycle?.transactionCount).toBe(1);
    expect(cycle?.summary.totalExpense).toBe(146);
  });
});
