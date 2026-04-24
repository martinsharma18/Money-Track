import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Category, Wallet } from '@/types';
import { supabase } from '@/utils/supabase';
import { toast } from 'react-hot-toast';


// Fixed UUIDs for defaults to pass Supabase UUID validation constraints
const defaultCategories: Category[] = [
  // Income
  { id: '11111111-1111-4000-8000-000000000001', type: 'INCOME', name: 'Salary', icon: '💼', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000002', type: 'INCOME', name: 'Freelance', icon: '💻', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000003', type: 'INCOME', name: 'Business', icon: '🏪', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000004', type: 'INCOME', name: 'Bonus', icon: '💰', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000005', type: 'INCOME', name: 'Gift', icon: '🎁', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000006', type: 'INCOME', name: 'Rent', icon: '🏠', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000007', type: 'INCOME', name: 'Interest', icon: '🏦', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000008', type: 'INCOME', name: 'Dividend', icon: '📈', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000009', type: 'INCOME', name: 'Other', icon: '💵', isCustom: false },

  // Expense — Nepali daily-use & basic categories
  { id: '22222222-2222-4000-8000-000000000001', type: 'EXPENSE', name: 'Rent', icon: '🏠', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000002', type: 'EXPENSE', name: 'Milk', icon: '🥛', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000003', type: 'EXPENSE', name: 'Tea', icon: '🍵', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000004', type: 'EXPENSE', name: 'Bus', icon: '🚌', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000005', type: 'EXPENSE', name: 'Kitchen', icon: '🍳', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000006', type: 'EXPENSE', name: 'Tarkari', icon: '🥦', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000007', type: 'EXPENSE', name: 'Gym', icon: '🏋️', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000008', type: 'EXPENSE', name: 'Loan', icon: '🏦', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000009', type: 'EXPENSE', name: 'Khaja', icon: '🥟', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000010', type: 'EXPENSE', name: 'Futsal', icon: '⚽', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000011', type: 'EXPENSE', name: 'Clothes', icon: '👕', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000012', type: 'EXPENSE', name: 'Coldrinks', icon: '🥤', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000013', type: 'EXPENSE', name: 'Girl', icon: '👧', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000014', type: 'EXPENSE', name: 'Health', icon: '🏥', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000015', type: 'EXPENSE', name: 'Education', icon: '📚', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000016', type: 'EXPENSE', name: 'Grocery', icon: '🛒', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000017', type: 'EXPENSE', name: 'Fuel', icon: '⛽', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000018', type: 'EXPENSE', name: 'Internet', icon: '🌐', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000019', type: 'EXPENSE', name: 'Electric', icon: '💡', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000020', type: 'EXPENSE', name: 'Water', icon: '💧', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000021', type: 'EXPENSE', name: 'Maintenance', icon: '🛠️', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000022', type: 'EXPENSE', name: 'Entertainment', icon: '🎬', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000023', type: 'EXPENSE', name: 'Insurance', icon: '🛡️', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000024', type: 'EXPENSE', name: 'Travel', icon: '✈️', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000025', type: 'EXPENSE', name: 'Gift', icon: '🎁', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000026', type: 'EXPENSE', name: 'Subscription', icon: '📺', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000027', type: 'EXPENSE', name: 'Beauty', icon: '💄', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000028', type: 'EXPENSE', name: 'Social', icon: '🍻', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000029', type: 'EXPENSE', name: 'Tax', icon: '📉', isCustom: false },
  { id: '22222222-2222-4000-8000-000000000030', type: 'EXPENSE', name: 'Other', icon: '💸', isCustom: false },
];

const defaultWallets: Wallet[] = [
  { id: '33333333-3333-4000-8000-000000000001', name: 'Cash', icon: '💵', balance: 0 },
  { id: '33333333-3333-4000-8000-000000000002', name: 'Wallet', icon: '👛', balance: 0 },
  { id: '33333333-3333-4000-8000-000000000003', name: 'Bank', icon: '🏦', balance: 0 },
];



export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      settings: {
        dateDisplay: 'BS',
        theme: 'light',
      },
      wallets: defaultWallets,
      categories: defaultCategories,
      transactions: [],
      loans: [],
      loanPayments: [],
      hasHydrated: false,
      
      isAddSheetOpen: false,
      editingTransactionId: null,
      selectedMonthIso: new Date().toISOString(),
      searchQuery: '',
      isSearchOpen: false,
      openAddSheet: (id) => set({ isAddSheetOpen: true, editingTransactionId: id || null }),
      closeAddSheet: () => set({ isAddSheetOpen: false, editingTransactionId: null }),
      setSelectedMonthIso: (iso) => set({ selectedMonthIso: iso }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
      
      setHasHydrated: (state) => set({ hasHydrated: state }),

      login: (user) => set({ user }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, transactions: [], wallets: defaultWallets, categories: defaultCategories, loans: [], loanPayments: [] });
      },
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      updateSettings: (data) => set((state) => ({ settings: { ...state.settings, ...data } })),
      
      addWallet: async (wallet) => {
        const { user } = useStore.getState();
        if (!user) return;
        const newWallet = { ...wallet, id: uuidv4(), user_id: user.id };
        set((state) => ({ wallets: [...state.wallets, newWallet] }));
        await supabase.from('wallets').insert(newWallet);
      },
      updateWallet: async (id, data) => {
        set((state) => ({ wallets: state.wallets.map(w => w.id === id ? { ...w, ...data } : w) }));
        await supabase.from('wallets').update(data).eq('id', id);
      },
      deleteWallet: async (id) => {
        set((state) => ({ wallets: state.wallets.filter(w => w.id !== id) }));
        await supabase.from('wallets').delete().eq('id', id);
      },
      
      addCategory: async (category) => {
        const { user } = useStore.getState();
        if (!user) return;
        const newCat = { ...category, id: uuidv4(), isCustom: true, order: useStore.getState().categories.length, user_id: user.id };
        set((state) => ({ categories: [...state.categories, newCat] }));
        
        // Map to snake_case for DB
        const dbPayload = {
           id: newCat.id,
           type: newCat.type,
           name: newCat.name,
           icon: newCat.icon,
           is_custom: newCat.isCustom,
           order: newCat.order,
           user_id: newCat.user_id
        };
        await supabase.from('categories').insert(dbPayload);
      },
      updateCategory: async (id, data) => {
        set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...data } : c) }));
        // Map to DB if necessary (we mostly just update order)
        const dbData: any = { ...data };
        if (data.isCustom !== undefined) {
           dbData.is_custom = data.isCustom;
           delete dbData.isCustom;
        }
        await supabase.from('categories').update(dbData).eq('id', id);
      },
      deleteCategory: async (id) => {
        set((state) => ({ categories: state.categories.filter(c => c.id !== id) }));
        await supabase.from('categories').delete().eq('id', id);
      },
      reorderCategories: async (type, orderedTxs) => {
        const otherTypeTxs = useStore.getState().categories.filter(c => c.type !== type);
        const updatedOrdered = orderedTxs.map((c, i) => ({ ...c, order: i }));
        set({ categories: [...otherTypeTxs, ...updatedOrdered] });
        for (const cat of updatedOrdered) {
          if (cat.isCustom) {
            await supabase.from('categories').update({ order: cat.order }).eq('id', cat.id);
          }
        }
      },
      
      addTransaction: async (transaction) => {
        const { user } = useStore.getState();
        if (!user) return;

        const id = uuidv4();
        const newTransaction = { ...transaction, id, user_id: user.id };
        
        // Optimistic update
        set((state) => {
          const updatedWallets = state.wallets.map(w => {
            if (w.id === transaction.walletId) {
              const amountChange = transaction.type === 'INCOME' ? Number(transaction.amount) : -Number(transaction.amount);
              return { ...w, balance: Number(w.balance) + amountChange };
            }
            return w;
          });
          return {
            transactions: [...state.transactions, newTransaction as any],
            wallets: updatedWallets
          };
        });

        // Sync to Supabase
        try {
          // Map to snake_case for Supabase
          const dbPayload = {
             id: newTransaction.id,
             type: newTransaction.type,
             amount: newTransaction.amount,
             note: newTransaction.note,
             date: newTransaction.date,
             category_id: newTransaction.categoryId,
             wallet_id: newTransaction.walletId,
             user_id: newTransaction.user_id
          };
          
          // Insert Transaction
          const { error: txError } = await supabase.from('transactions').insert(dbPayload);
          if (txError) throw txError;
          
          // Update Wallet Balance in DB
          const wallet = useStore.getState().wallets.find(w => w.id === transaction.walletId);
          if (wallet) {
            const { error: wError } = await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
            if (wError) throw wError;
          }
        } catch (error) {
          console.error('Error syncing transaction:', error);
          toast.error("Cloud sync failed. Check your connection or categories.");
        }
      },

      updateTransaction: async (id, data) => {
        let oldTx: any = null;
        let newTx: any = null;
        let affectedWalletIds: string[] = [];

        // Optimistic UI Update
        set((state) => {
          oldTx = state.transactions.find(t => t.id === id);
          if (!oldTx) return state;

          newTx = { ...oldTx, ...data };
          affectedWalletIds = Array.from(new Set([oldTx.walletId, newTx.walletId]));
          
          let updatedWallets = state.wallets.map(w => {
             // 1. Revert old impact
             if (w.id === oldTx.walletId) {
               const revertAmount = oldTx.type === 'INCOME' ? -Number(oldTx.amount) : Number(oldTx.amount);
               w = { ...w, balance: Number(w.balance) + revertAmount };
             }
             // 2. Apply new impact (using the potentially updated wallet from step 1)
             if (w.id === newTx.walletId) {
               const applyAmount = newTx.type === 'INCOME' ? Number(newTx.amount) : -Number(newTx.amount);
               w = { ...w, balance: Number(w.balance) + applyAmount };
             }
             return w;
          });

          return {
            transactions: state.transactions.map(t => t.id === id ? newTx : t),
            wallets: updatedWallets
          };
        });

        // Supabase Sync
        try {
          const { user, wallets } = useStore.getState();
          if (!user || !newTx) return;
          
          // Update Transaction
          const { error } = await supabase.from('transactions').update({
            type: newTx.type,
            amount: newTx.amount,
            category_id: newTx.categoryId,
            wallet_id: newTx.walletId,
            note: newTx.note,
            date: newTx.date
          }).eq('id', id);
          
          if (error) throw error;

          // Sync only affected wallets
          for (const walletId of affectedWalletIds) {
            const wallet = wallets.find(w => w.id === walletId);
            if (wallet) {
              await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
            }
          }
        } catch (error) {
          console.error('Error updating transaction in DB:', error);
          toast.error("Failed to sync update");
        }
      },

      deleteTransaction: async (id) => {
        let deletedTx: any = null;

        // Optimistic UI Update
        set((state) => {
          deletedTx = state.transactions.find(t => t.id === id);
          if (!deletedTx) return state;

          const updatedWallets = state.wallets.map(w => {
             if (w.id === deletedTx.walletId) {
               const revertAmount = deletedTx.type === 'INCOME' ? -Number(deletedTx.amount) : Number(deletedTx.amount);
               return { ...w, balance: Number(w.balance) + revertAmount };
             }
             return w;
          });

          return {
            transactions: state.transactions.filter(t => t.id !== id),
            wallets: updatedWallets
          };
        });

        // Supabase Sync
        try {
          const { user, wallets } = useStore.getState();
          if (!user || !deletedTx) return;

          const { error } = await supabase.from('transactions').delete().eq('id', id);
          if (error) throw error;
          
          // Sync affected wallet
          const wallet = wallets.find(w => w.id === deletedTx.walletId);
          if (wallet) {
            await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
          }
        } catch (error) {
          console.error('Error deleting transaction in DB:', error);
          toast.error("Failed to sync deletion");
        }
      },

      addLoan: async (loan) => {
        const { user } = useStore.getState();
        if (!user) return;

        const id = uuidv4();
        const newLoan = { ...loan, id, remainingAmount: loan.amount, status: 'ACTIVE' as const, user_id: user.id };
        
        set((state) => {
          const updatedWallets = state.wallets.map(w => {
            if (w.id === loan.walletId) {
              const amountChange = loan.type === 'BORROWED' ? Number(loan.amount) : -Number(loan.amount);
              return { ...w, balance: Number(w.balance) + amountChange };
            }
            return w;
          });
          return {
            loans: [...state.loans, newLoan as any],
            wallets: updatedWallets
          };
        });

        try {
          const dbPayload = {
            id: newLoan.id,
            user_id: newLoan.user_id,
            wallet_id: newLoan.walletId,
            person_name: newLoan.personName,
            amount: newLoan.amount,
            remaining_amount: newLoan.remainingAmount,
            interest_rate: newLoan.interestRate,
            type: newLoan.type,
            status: newLoan.status,
            due_date: newLoan.dueDate,
            date: newLoan.date,
            note: newLoan.note
          };
          
          await supabase.from('loans').insert(dbPayload);
          
          const wallet = useStore.getState().wallets.find(w => w.id === loan.walletId);
          if (wallet) {
            await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
          }
        } catch (error) {
          console.error('Error adding loan:', error);
          toast.error("Failed to sync loan");
        }
      },

      updateLoan: async (id, data) => {
        let oldLoan: any = null;
        let newLoan: any = null;
        let affectedWalletIds: string[] = [];

        set((state) => {
          oldLoan = state.loans.find(l => l.id === id);
          if (!oldLoan) return state;

          newLoan = { ...oldLoan, ...data };
          affectedWalletIds = Array.from(new Set([oldLoan.walletId, newLoan.walletId]));

          const updatedWallets = state.wallets.map(w => {
            // 1. Revert old impact
            if (w.id === oldLoan.walletId) {
              const revertAmount = oldLoan.type === 'BORROWED' ? -Number(oldLoan.amount) : Number(oldLoan.amount);
              w = { ...w, balance: Number(w.balance) + revertAmount };
            }
            // 2. Apply new impact
            if (w.id === newLoan.walletId) {
              const applyAmount = newLoan.type === 'BORROWED' ? Number(newLoan.amount) : -Number(newLoan.amount);
              w = { ...w, balance: Number(w.balance) + applyAmount };
            }
            return w;
          });

          return {
            loans: state.loans.map(l => l.id === id ? newLoan : l),
            wallets: updatedWallets
          };
        });

        try {
          const { user, wallets } = useStore.getState();
          if (!user || !newLoan) return;

          const dbData: any = { ...data };
          if (data.personName) { dbData.person_name = data.personName; delete dbData.personName; }
          if (data.walletId) { dbData.wallet_id = data.walletId; delete dbData.walletId; }
          if (data.remainingAmount !== undefined) { dbData.remaining_amount = data.remainingAmount; delete dbData.remainingAmount; }
          if (data.interestRate !== undefined) { dbData.interest_rate = data.interestRate; delete dbData.interestRate; }
          if (data.dueDate !== undefined) { dbData.due_date = data.dueDate; delete dbData.dueDate; }
          
          await supabase.from('loans').update(dbData).eq('id', id);

          // Sync affected wallets
          for (const walletId of affectedWalletIds) {
            const wallet = wallets.find(w => w.id === walletId);
            if (wallet) {
              await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
            }
          }
        } catch (error) {
          console.error('Error updating loan:', error);
        }
      },

      deleteLoan: async (id) => {
        let deletedLoan: any = null;

        set((state) => {
          deletedLoan = state.loans.find(l => l.id === id);
          if (!deletedLoan) return state;

          const updatedWallets = state.wallets.map(w => {
            if (w.id === deletedLoan.walletId) {
              const revertAmount = deletedLoan.type === 'BORROWED' ? -Number(deletedLoan.amount) : Number(deletedLoan.amount);
              return { ...w, balance: Number(w.balance) + revertAmount };
            }
            return w;
          });

          return {
            loans: state.loans.filter(l => l.id !== id),
            wallets: updatedWallets
          };
        });

        try {
          const { user, wallets } = useStore.getState();
          if (!user || !deletedLoan) return;

          await supabase.from('loans').delete().eq('id', id);
          
          const wallet = wallets.find(w => w.id === deletedLoan.walletId);
          if (wallet) {
            await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
          }
        } catch (error) {
          console.error('Error deleting loan:', error);
        }
      },

      addLoanPayment: async (payment) => {
        const { user } = useStore.getState();
        if (!user) return;

        const id = uuidv4();
        const newPayment = { ...payment, id, user_id: user.id };

        set((state) => {
          const loan = state.loans.find(l => l.id === payment.loanId);
          if (!loan) return state;

          const newRemaining = Number(loan.remainingAmount) - Number(payment.amount);
          const newStatus = newRemaining <= 0 ? 'PAID' : 'ACTIVE';

          const updatedLoans = state.loans.map(l => 
            l.id === payment.loanId ? { ...l, remainingAmount: newRemaining, status: newStatus as any } : l
          );

          const updatedWallets = state.wallets.map(w => {
            if (w.id === payment.walletId) {
              // If we BORROWED, paying back is an EXPENSE (-balance)
              // If we LENT, getting paid back is INCOME (+balance)
              const amountChange = loan.type === 'BORROWED' ? -Number(payment.amount) : Number(payment.amount);
              return { ...w, balance: Number(w.balance) + amountChange };
            }
            return w;
          });

          return {
            loanPayments: [...state.loanPayments, newPayment as any],
            loans: updatedLoans,
            wallets: updatedWallets
          };
        });

        try {
          const dbPayload = {
            id: newPayment.id,
            user_id: newPayment.user_id,
            loan_id: newPayment.loanId,
            wallet_id: newPayment.walletId,
            amount: newPayment.amount,
            date: newPayment.date,
            note: newPayment.note
          };
          await supabase.from('loan_payments').insert(dbPayload);

          const loan = useStore.getState().loans.find(l => l.id === payment.loanId);
          if (loan) {
            await supabase.from('loans').update({ 
              remaining_amount: loan.remainingAmount, 
              status: loan.status 
            }).eq('id', loan.id);
          }

          const wallet = useStore.getState().wallets.find(w => w.id === payment.walletId);
          if (wallet) {
            await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
          }
        } catch (error) {
          console.error('Error adding payment:', error);
          toast.error("Failed to sync payment");
        }
      },

      deleteLoanPayment: async (id) => {
        const payment = useStore.getState().loanPayments.find(p => p.id === id);
        if (!payment) return;

        set((state) => {
          const loan = state.loans.find(l => l.id === payment.loanId);
          if (!loan) return state;

          const newRemaining = Number(loan.remainingAmount) + Number(payment.amount);
          const newStatus = newRemaining <= 0 ? 'PAID' : 'ACTIVE';

          const updatedLoans = state.loans.map(l => 
            l.id === payment.loanId ? { ...l, remainingAmount: newRemaining, status: newStatus as any } : l
          );

          const updatedWallets = state.wallets.map(w => {
            if (w.id === payment.walletId) {
              const amountChange = loan.type === 'BORROWED' ? Number(payment.amount) : -Number(payment.amount);
              return { ...w, balance: Number(w.balance) + amountChange };
            }
            return w;
          });

          return {
            loanPayments: state.loanPayments.filter(p => p.id !== id),
            loans: updatedLoans,
            wallets: updatedWallets
          };
        });

        try {
          await supabase.from('loan_payments').delete().eq('id', id);
          
          const loan = useStore.getState().loans.find(l => l.id === payment.loanId);
          if (loan) {
             await supabase.from('loans').update({ 
               remaining_amount: loan.remainingAmount, 
               status: loan.status 
             }).eq('id', loan.id);
          }

          const wallet = useStore.getState().wallets.find(w => w.id === payment.walletId);
          if (wallet) {
            await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
          }
        } catch (error) {
          console.error('Error deleting payment:', error);
        }
      },

      fetchInitialData: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.warn('No active Supabase session found. Logging out.');
          useStore.getState().logout();
          return;
        }

        const user = session.user;
        
        // Ensure user in store matches session user
        if (useStore.getState().user?.id !== user.id) {
           useStore.getState().login({
             id: user.id,
             email: user.email || '',
             name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
           });
        }


        try {
          // 1. Fetch User Categories (No need to upsert defaults, they stay in UI)
          const { data: categories, error: cError } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id);

          if (cError) throw cError;

          
          if (categories && categories.length > 0) {
            const mappedCategories = categories.map((c: any) => ({
               id: c.id,
               type: c.type,
               name: c.name,
               icon: c.icon,
               isCustom: c.is_custom !== undefined ? c.is_custom : !!c.isCustom,
               order: c.order
            }));
            
            // Deduplicate: preference goes to defaults (hardcoded IDs) and user-specific custom ones
            const customCats = mappedCategories.filter(c => c.isCustom);
            set({ categories: [...defaultCategories, ...customCats] });
          } else {
             set({ categories: defaultCategories });
          }

          // 2. Fetch Wallets (Seed if missing)
          const { data: wallets, error: wError } = await supabase.from('wallets').select('*').eq('user_id', user.id);
          if (wError) throw wError;

          if (wallets && wallets.length > 0) {
            const mappedWallets = wallets.map((w: any) => ({
              ...w,
              balance: Number(w.balance)
            }));
            set({ wallets: mappedWallets });
          } else {
            const initialWallets = defaultWallets.map(w => ({
              ...w,
              id: uuidv4(),
              user_id: user.id
            }));
            await supabase.from('wallets').insert(initialWallets);
            set({ wallets: initialWallets });
          }

          // 3. Fetch Transactions mapping snake_case from DB to camelCase UI
          const { data: transactions, error: tError } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false });
          if (tError) throw tError;
          if (transactions) {
            const mappedTransactions = transactions.map((t: any) => ({
                id: t.id,
                type: t.type,
                amount: Number(t.amount),
                note: t.note,
                date: t.date,
                categoryId: t.category_id || t.categoryId, // Fallback if API hasn't changed
                walletId: t.wallet_id || t.walletId
            }));
            set({ transactions: mappedTransactions });
          }

          // 4. Fetch Loans
          const { data: loans, error: lError } = await supabase.from('loans').select('*').eq('user_id', user.id);
          if (!lError && loans) {
            const mappedLoans = loans.map((l: any) => ({
              id: l.id,
              type: l.type,
              personName: l.person_name,
              amount: Number(l.amount),
              remainingAmount: Number(l.remaining_amount),
              interestRate: l.interest_rate,
              dueDate: l.due_date,
              date: l.date,
              note: l.note,
              walletId: l.wallet_id,
              status: l.status
            }));
            set({ loans: mappedLoans });
          }

          // 5. Fetch Loan Payments
          const { data: payments, error: lpError } = await supabase.from('loan_payments').select('*').eq('user_id', user.id);
          if (!lpError && payments) {
             const mappedPayments = payments.map((p: any) => ({
               id: p.id,
               loanId: p.loan_id,
               amount: Number(p.amount),
               date: p.date,
               walletId: p.wallet_id,
               note: p.note
             }));
             set({ loanPayments: mappedPayments });
          }

        } catch (error: any) {
          console.error('Initial data fetch error:', error);
          if (error?.status === 401 || error?.message?.includes('Unauthorized')) {
            console.warn('Session unauthorized. Logging out.');
            useStore.getState().logout();
          }
        }
      },



    }),
    {
      name: 'money-track-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
);
