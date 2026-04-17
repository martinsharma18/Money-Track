export type TransactionType = 'INCOME' | 'EXPENSE';

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

export interface Settings {
  dateDisplay: 'BS' | 'AD';
}

export interface AppState {
  user: User | null;
  settings: Settings;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  
  // UI State
  isAddSheetOpen: boolean;
  editingTransactionId: string | null;
  openAddSheet: (transactionId?: string) => void;
  closeAddSheet: () => void;
  
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
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}
