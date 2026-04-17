import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Category, Wallet } from '@/types';

const defaultCategories: Category[] = [
  // Income
  { id: 'cat-inc-1', type: 'INCOME', name: 'Salary', icon: '💼', isCustom: false },
  { id: 'cat-inc-2', type: 'INCOME', name: 'Freelance', icon: '💻', isCustom: false },
  { id: 'cat-inc-3', type: 'INCOME', name: 'Business', icon: '🏪', isCustom: false },
  { id: 'cat-inc-4', type: 'INCOME', name: 'Gift', icon: '🎁', isCustom: false },
  { id: 'cat-inc-5', type: 'INCOME', name: 'Rent', icon: '🏠', isCustom: false },
  { id: 'cat-inc-6', type: 'INCOME', name: 'Other', icon: '💰', isCustom: false },
  // Expense
  { id: 'cat-exp-1', type: 'EXPENSE', name: 'Food', icon: '🍔', isCustom: false },
  { id: 'cat-exp-2', type: 'EXPENSE', name: 'Milk', icon: '🥛', isCustom: false },
  { id: 'cat-exp-3', type: 'EXPENSE', name: 'Rent', icon: '🏠', isCustom: false },
  { id: 'cat-exp-4', type: 'EXPENSE', name: 'Transport', icon: '🚌', isCustom: false },
  { id: 'cat-exp-5', type: 'EXPENSE', name: 'Health', icon: '💊', isCustom: false },
  { id: 'cat-exp-6', type: 'EXPENSE', name: 'Education', icon: '📚', isCustom: false },
  { id: 'cat-exp-7', type: 'EXPENSE', name: 'Shopping', icon: '🛒', isCustom: false },
  { id: 'cat-exp-8', type: 'EXPENSE', name: 'Utilities', icon: '💡', isCustom: false },
  { id: 'cat-exp-9', type: 'EXPENSE', name: 'Entertainment', icon: '🎬', isCustom: false },
  { id: 'cat-exp-10', type: 'EXPENSE', name: 'Mobile', icon: '📱', isCustom: false },
  { id: 'cat-exp-11', type: 'EXPENSE', name: 'Other', icon: '💸', isCustom: false },
];

const defaultWallets: Wallet[] = [
  { id: 'wal-1', name: 'Cash', icon: '💵', balance: 0 },
  { id: 'wal-2', name: 'eSewa', icon: '📱', balance: 0 },
  { id: 'wal-3', name: 'Bank', icon: '🏦', balance: 0 },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      settings: {
        dateDisplay: 'BS',
      },
      wallets: defaultWallets,
      categories: defaultCategories,
      transactions: [],
      hasHydrated: false,
      
      isAddSheetOpen: false,
      editingTransactionId: null,
      openAddSheet: (id) => set({ isAddSheetOpen: true, editingTransactionId: id || null }),
      closeAddSheet: () => set({ isAddSheetOpen: false, editingTransactionId: null }),
      
      setHasHydrated: (state) => set({ hasHydrated: state }),

      login: (user) => set({ user }),
      logout: () => set({ user: null, transactions: [], wallets: defaultWallets, categories: defaultCategories }),
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      updateSettings: (data) => set((state) => ({ settings: { ...state.settings, ...data } })),
      
      addWallet: (wallet) => set((state) => ({ wallets: [...state.wallets, { ...wallet, id: uuidv4() }] })),
      updateWallet: (id, data) => set((state) => ({ wallets: state.wallets.map(w => w.id === id ? { ...w, ...data } : w) })),
      deleteWallet: (id) => set((state) => ({ wallets: state.wallets.filter(w => w.id !== id) })),
      
      addCategory: (category) => set((state) => ({ categories: [...state.categories, { ...category, id: uuidv4(), isCustom: true, order: state.categories.length }] })),
      updateCategory: (id, data) => set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCategory: (id) => set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),
      reorderCategories: (type, orderedTxs) => set((state) => {
        const otherTypeTxs = state.categories.filter(c => c.type !== type);
        const updatedOrdered = orderedTxs.map((c, i) => ({ ...c, order: i }));
        return { categories: [...otherTypeTxs, ...updatedOrdered] };
      }),
      
      addTransaction: (transaction) => set((state) => {
        const newTransaction = { ...transaction, id: uuidv4() };
        
        // Update wallet balance
        const updatedWallets = state.wallets.map(w => {
           if (w.id === transaction.walletId) {
             const amountChange = transaction.type === 'INCOME' ? transaction.amount : -transaction.amount;
             return { ...w, balance: w.balance + amountChange };
           }
           return w;
        });

        return {
          transactions: [...state.transactions, newTransaction],
          wallets: updatedWallets
        };
      }),

      updateTransaction: (id, data) => set((state) => {
        const oldTransaction = state.transactions.find(t => t.id === id);
        if (!oldTransaction) return state;

        const updatedTransaction = { ...oldTransaction, ...data };
        
        // Revert old effect
        let updatedWallets = state.wallets.map(w => {
           if (w.id === oldTransaction.walletId) {
             const amountChange = oldTransaction.type === 'INCOME' ? -oldTransaction.amount : oldTransaction.amount;
             return { ...w, balance: w.balance + amountChange };
           }
           return w;
        });

        // Apply new effect
        updatedWallets = updatedWallets.map(w => {
           if (w.id === updatedTransaction.walletId) {
             const amountChange = updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount;
             return { ...w, balance: w.balance + amountChange };
           }
           return w;
        });

        return {
          transactions: state.transactions.map(t => t.id === id ? updatedTransaction : t),
          wallets: updatedWallets
        };
      }),

      deleteTransaction: (id) => set((state) => {
        const transaction = state.transactions.find(t => t.id === id);
        if (!transaction) return state;

        // Revert effect
        const updatedWallets = state.wallets.map(w => {
           if (w.id === transaction.walletId) {
             const amountChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
             return { ...w, balance: w.balance + amountChange };
           }
           return w;
        });

        return {
          transactions: state.transactions.filter(t => t.id !== id),
          wallets: updatedWallets
        };
      }),
    }),
    {
      name: 'money-track-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
);
