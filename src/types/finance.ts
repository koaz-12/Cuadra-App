export type Currency = 'DOP' | 'USD';

export interface Transaction {
  id: string;
  date: string; // ISO Date
  type: 'PAGO' | 'CORTE' | 'COMPRA';
  amount: number;
  description?: string;
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: number;
  monthlyAmount: number;
  totalInstallments: number;
  currentInstallment: number;
  parentId?: string;
}

export interface CreditCard {
  id: string;
  bankName: string;
  alias: string;
  last4Digits?: string; // New field
  type: 'Visa' | 'Mastercard' | 'Amex' | 'Other';
  creditLimit: number;
  currency: Currency;
  cutoffDay: number; // Day of month (1-31)
  paymentDueDay: number; // Day of month (1-31)
  paymentWindowDays?: number; // Days after cutoff (e.g. 22 days)
  parentCardId?: string; // ID of the parent card (for Dual Currency)
  currentBalance: number;
  statementBalance: number; // Deuda al corte
  minimumPayment: number;
  status: 'Active' | 'Locked';
  isSharedLimit?: boolean; // New field for Shared Limit logic
  history?: Transaction[];
  installments?: Installment[];
}

export interface BudgetCategory {
  id: string;
  userId: string;
  name: string;
  monthlyLimit: number; // Presupuesto mensual
  icon?: string; // Emoji
  color?: string; // Tailwind class or Hex
  sortOrder?: number;
  spent?: number; // Calculated field (total expenses this month)
}

export interface VariableExpense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  date: string | Date;
  description?: string;
}

export interface Loan {
  id: string;
  bankName: string;
  alias: string;
  last4Digits?: string; // New field
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  currency: Currency;
  paymentDay: number; // Day of month
  interestRate?: number; // Annual Interest Rate %
  status: 'Active' | 'Paid';
  history?: Transaction[];
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  dueDay: number;
  isPaid: boolean;
  history?: Transaction[];
}
