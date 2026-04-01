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
  color?: string;
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
  account?: Account;
  categoryId?: string;
  category?: Category;
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

// ── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardMemberStat {
  memberId: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
  expenseCount: number;
}

export interface DashboardCategoryStat {
  categoryId: string;
  name: string;
  icon?: string;
  color?: string;
  total: number;
  percentage: number;
  expenseCount: number;
}

export interface DashboardAccountStat {
  accountId: string;
  name: string;
  type: ExpenseSource;
  total: number;
}

export interface DashboardUnassigned {
  count: number;
  total: number;
}

export interface DashboardResponse {
  totalAmount: number;
  assignedAmount: number;
  unassignedAmount: number;
  expenseCount: number;
  byMember: DashboardMemberStat[];
  byCategory: DashboardCategoryStat[];
  byAccount: DashboardAccountStat[];
  unassigned: DashboardUnassigned;
  recentExpenses: Expense[];
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
