export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt?: string;
}

export interface Member {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface Account {
  id: string;
  groupId: string;
  name: string;
  type: 'CARD' | 'CASH' | 'TRANSFER' | 'DIGITAL_WALLET';
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseStatus = 'PENDING' | 'CLASSIFIED' | 'ASSIGNED' | 'VOIDED' | 'IMPORTED';
export type ExpenseSource = 'CARD' | 'CASH' | 'TRANSFER' | 'DIGITAL_WALLET';

export interface Expense {
  id: string;
  groupId: string;
  accountId?: string;
  categoryId?: string;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  source: ExpenseSource;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
  percentage?: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  groupId: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Import {
  id: string;
  groupId: string;
  accountId: string;
  filename: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows?: number;
  importedRows?: number;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Export {
  id: string;
  groupId: string;
  filename: string;
  url: string;
  createdAt?: string;
}

export interface DashboardResponse {
  totalExpenses: number;
  totalAmount: number;
  pendingExpenses: number;
  members: Member[];
  recentExpenses: Expense[];
  balances: Record<string, number>;
}

export interface ReconciliationItem {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  fromMember?: Member;
  toMember?: Member;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
