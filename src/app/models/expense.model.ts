export interface Category {
  name: string;
  limit: number;
}

export interface IncomeSource {
  name: string;
  amount: number;
}

export interface Cycle {
  from: string;
  to: string;
}

export interface Config {
  cycleStartDay: number;
  cycle?: Cycle;
  categories: Category[];
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  shortage: number;
  isOverBudget: boolean;
}

export interface CategorySummary {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  overLimit: boolean;
}

export interface Transaction {
  sno: number;
  name: string;
  category: string;
  price: number;
  date: string;
}

export interface MonthData {
  month: string;
  incomeSources: IncomeSource[];
  summary: Summary;
  categorySummary: CategorySummary[];
  transactions: Transaction[];
}

export interface CycleData {
  label: string;
  cycleFrom: Date;
  cycleTo: Date;
  transactionCount: number;
  incomeSources: IncomeSource[];
  summary: Summary;
  categorySummary: CategorySummary[];
  transactions: Transaction[];
}

export interface ExpenseResponse {
  success: boolean;
  isDevelopment: boolean;
  message?: string;
  config: Config;
  months: MonthData[];
}
