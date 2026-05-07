import {
  Category,
  CategorySummary,
  CycleData,
  ExpenseResponse,
  IncomeSource,
  MonthData,
  Summary,
  Transaction,
} from '../models/expense.model';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseMonthLabel(label: string): { month: number; year: number } {
  const [name, yearStr] = label.split('-');
  return { month: MONTH_INDEX[name], year: parseInt(yearStr, 10) };
}

function formatCycleLabel(from: Date, to: Date): string {
  const fromMonth = MONTH_NAMES[from.getMonth()];
  const toMonth = MONTH_NAMES[to.getMonth()];
  return `${fromMonth} ${from.getDate()} – ${toMonth} ${to.getDate()}`;
}

function recalculateCategorySummary(
  transactions: Transaction[],
  categories: Category[],
): CategorySummary[] {
  const spentMap = new Map<string, number>();
  for (const tx of transactions) {
    spentMap.set(tx.category, (spentMap.get(tx.category) ?? 0) + tx.price);
  }

  return categories
    .map((cat) => {
      const spent = spentMap.get(cat.name) ?? 0;
      const remaining = cat.limit - spent;
      return {
        category: cat.name,
        limit: cat.limit,
        spent,
        remaining,
        overLimit: cat.limit > 0 && spent > cat.limit,
      };
    })
    .filter((cs) => cs.limit > 0 || cs.spent > 0);
}

function recalculateSummary(transactions: Transaction[], incomeSources: IncomeSource[]): Summary {
  const totalIncome = incomeSources.reduce((s, src) => s + src.amount, 0);
  const totalExpense = transactions.reduce((s, tx) => s + tx.price, 0);
  const net = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    savings: net >= 0 ? net : 0,
    shortage: net < 0 ? -net : 0,
    isOverBudget: net < 0,
  };
}

/**
 * When cycleStartDay=1 (or dev mode), maps each API month directly to a CycleData.
 */
function mapDirectly(months: MonthData[]): CycleData[] {
  return months.map((m) => {
    const parsed = parseMonthLabel(m.month);
    const from = new Date(parsed.year, parsed.month, 1);
    const lastDay = new Date(parsed.year, parsed.month + 1, 0).getDate();
    const to = new Date(parsed.year, parsed.month, lastDay, 23, 59, 59, 999);

    return {
      label: m.month,
      cycleFrom: from,
      cycleTo: to,
      transactionCount: m.transactions.length,
      incomeSources: m.incomeSources,
      summary: m.summary,
      categorySummary: m.categorySummary,
      transactions: m.transactions,
    };
  });
}

/**
 * When cycleStartDay != 1, re-slices transactions into cycle periods
 * and recalculates summary + categorySummary per cycle.
 *
 * For API months [Apr, May] with startDay=25:
 *   Cycle 0: Mar 25 – Apr 24  (transactions from Apr sheet dated before Apr 25)
 *   Cycle 1: Apr 25 – May 24  (Apr sheet ≥ Apr 25 + May sheet < May 25)
 *
 * Income mapping: each cycle's income comes from the API month whose
 * startDay begins that cycle. Cycle "Apr 25 – May 24" → April's income.
 * If the source month isn't in the data, fall back to the earliest available.
 */
function sliceIntoCycles(
  months: MonthData[],
  startDay: number,
  categories: Category[],
): CycleData[] {
  const allTransactions: Transaction[] = months.flatMap((m) => m.transactions);

  // Build income lookup keyed by "year-monthIndex"
  const incomeByKey = new Map<string, IncomeSource[]>();
  const parsedMonths: { month: number; year: number; income: IncomeSource[] }[] = [];

  for (const m of months) {
    const parsed = parseMonthLabel(m.month);
    incomeByKey.set(`${parsed.year}-${parsed.month}`, m.incomeSources);
    parsedMonths.push({ ...parsed, income: m.incomeSources });
  }

  const cycles: CycleData[] = [];

  for (const pm of parsedMonths) {
    // Cycle for API month M covers: (M-1).startDay → M.(startDay-1)
    let prevMonth = pm.month - 1;
    let prevYear = pm.year;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    const cycleFrom = new Date(prevYear, prevMonth, startDay);
    const cycleTo = new Date(pm.year, pm.month, startDay - 1, 23, 59, 59, 999);
    // Exclusive upper bound for filtering
    const cycleNextFrom = new Date(pm.year, pm.month, startDay);

    // Slice transactions by local date
    const txns = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= cycleFrom && d < cycleNextFrom;
    });

    // Income: from the month containing cycle start (prevMonth)
    const incomeKey = `${prevYear}-${prevMonth}`;
    const incomeSources = incomeByKey.get(incomeKey) ?? pm.income;

    const categorySummary = recalculateCategorySummary(txns, categories);
    const summary = recalculateSummary(txns, incomeSources);
    const label = formatCycleLabel(cycleFrom, cycleTo);

    cycles.push({
      label,
      cycleFrom,
      cycleTo,
      transactionCount: txns.length,
      incomeSources,
      summary,
      categorySummary,
      transactions: txns,
    });
  }

  return cycles;
}

/**
 * Transforms the raw API response into cycle-based data that the UI consumes.
 */
export function transformToCycles(response: ExpenseResponse): CycleData[] {
  const { config, months } = response;
  const startDay = config.cycleStartDay;

  if (startDay === 1 || response.isDevelopment) {
    return mapDirectly(months);
  }

  return sliceIntoCycles(months, startDay, config.categories);
}
