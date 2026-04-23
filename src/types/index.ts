export type TransactionType = 'INCOME' | 'EXPENSE';
export type LoanType = 'LENT' | 'BORROWED';


export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  balance: number;
}

export interface Category {
  id: string;
  type: TransactionType;
  name: string;
  icon: string;
  isCustom: boolean;
  order?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  date: string; // ISO string UTC
  note: string;
}

export interface Loan {
  id: string;
  type: LoanType;
  personName: string;
  amount: number;
  remainingAmount: number;
  interestRate?: number;
  dueDate?: string;
  date: string;
  note: string;
  walletId: string;
  status: 'ACTIVE' | 'PAID';
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  walletId: string;
  note: string;
}


export interface Settings {
  dateDisplay: 'BS' | 'AD';
  theme: 'light' | 'dark';
}

export interface AppState {
  user: User | null;
  settings: Settings;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  loans: Loan[];
  loanPayments: LoanPayment[];

  
  // UI State
  isAddSheetOpen: boolean;
  editingTransactionId: string | null;
  selectedMonthIso: string;
  searchQuery: string;
  isSearchOpen: boolean;
  openAddSheet: (transactionId?: string) => void;
  closeAddSheet: () => void;
  setSelectedMonthIso: (iso: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  updateSettings: (data: Partial<Settings>) => void;
  
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, data: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  
  addCategory: (category: Omit<Category, 'id' | 'isCustom'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (type: TransactionType, categories: Category[]) => void;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  addLoan: (loan: Omit<Loan, 'id' | 'remainingAmount' | 'status'>) => void;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  addLoanPayment: (payment: Omit<LoanPayment, 'id'>) => void;
  deleteLoanPayment: (id: string) => void;

  
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  fetchInitialData: () => Promise<void>;
}
