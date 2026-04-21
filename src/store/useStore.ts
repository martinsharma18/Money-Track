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
  { id: '11111111-1111-4000-8000-000000000004', type: 'INCOME', name: 'Gift', icon: '🎁', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000005', type: 'INCOME', name: 'Rent', icon: '🏠', isCustom: false },
  { id: '11111111-1111-4000-8000-000000000006', type: 'INCOME', name: 'Other', icon: '💰', isCustom: false },
  // Expense — Nepali daily-use categories
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
  { id: '22222222-2222-4000-8000-000000000014', type: 'EXPENSE', name: 'Other', icon: '💸', isCustom: false },
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
        set({ user: null, transactions: [], wallets: defaultWallets, categories: defaultCategories });
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
              const amountChange = transaction.type === 'INCOME' ? transaction.amount : -transaction.amount;
              return { ...w, balance: w.balance + amountChange };
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
          await supabase.from('transactions').insert(dbPayload);
          
          // Update Wallet Balance in DB
          const wallet = useStore.getState().wallets.find(w => w.id === transaction.walletId);
          if (wallet) {
            await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', wallet.id);
          }
        } catch (error) {
          console.error('Error syncing transaction:', error);
          toast.error("Cloud sync failed, will retry later");
        }
      },

      updateTransaction: async (id, data) => {
        // Optimistic UI Update
        set((state) => {
          const oldTransaction = state.transactions.find(t => t.id === id);
          if (!oldTransaction) return state;

          const updatedTransaction = { ...oldTransaction, ...data };
          
          let updatedWallets = state.wallets.map(w => {
             if (w.id === oldTransaction.walletId) {
               const amountChange = oldTransaction.type === 'INCOME' ? -oldTransaction.amount : oldTransaction.amount;
               return { ...w, balance: w.balance + amountChange };
             }
             return w;
          });

          updatedWallets = updatedWallets.map(w => {
             if (w.id === updatedTransaction.walletId) {
               const amountChange = updatedTransaction.type === 'INCOME' ? updatedTransaction.amount : -updatedTransaction.amount;
               return { ...w, balance: w.balance + amountChange };
             }
             return w;
          });

          return {
            transactions: state.transactions.map(t => t.id === id ? updatedTransaction as any : t),
            wallets: updatedWallets
          };
        });

        // Supabase Sync
        try {
          const { user, transactions, wallets } = useStore.getState();
          if (!user) return;
          
          const updatedTx = transactions.find(t => t.id === id);
          if (updatedTx) {
             // We do separate update/delete in DB
             const { error } = await supabase.from('transactions').update({
               type: updatedTx.type,
               amount: updatedTx.amount,
               category_id: updatedTx.categoryId,
               wallet_id: updatedTx.walletId,
               note: updatedTx.note,
               date: updatedTx.date
             }).eq('id', id);
             
             if (error) throw error;

             // Only sync the wallets that changed
             // It's safer to just sync all of them since we might have moved from one to another
             for (const w of wallets) {
               await supabase.from('wallets').update({ balance: w.balance }).eq('id', w.id);
             }
          }
        } catch (error) {
          console.error('Error updating transaction in DB:', error);
          toast.error("Failed to sync update");
        }
      },

      deleteTransaction: async (id) => {
        // Optimistic UI Update
        set((state) => {
          const transaction = state.transactions.find(t => t.id === id);
          if (!transaction) return state;

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
        });

        // Supabase Sync
        try {
          const { user, wallets } = useStore.getState();
          if (!user) return;

          const { error } = await supabase.from('transactions').delete().eq('id', id);
          if (error) throw error;
          
          // Re-sync all wallets just to be safe
          for (const w of wallets) {
             await supabase.from('wallets').update({ balance: w.balance }).eq('id', w.id);
          }
        } catch (error) {
          console.error('Error deleting transaction in DB:', error);
          toast.error("Failed to sync deletion");
        }
      },

      fetchInitialData: async () => {
        const { user } = (useStore.getState() as any);
        if (!user) return;

        // Simple UUID validation to prevent 400 errors from Supabase if an old dummy ID (like 'u1') is present
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.id)) {
          console.warn('Invalid user ID format detected. Logging out to clear state.');
          useStore.getState().logout();
          return;
        }

        try {
          // 1. Fetch Categories (User specific + Global defaults)
          const { data: categories, error: cError } = await supabase
            .from('categories')
            .select('*')
            .or(`user_id.eq.${user.id},user_id.is.null`);

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
            
            // Prefer user's version of a category if there are name/type collisions, 
            // but for now we just filter custom vs default based on hardcoded IDs
            const customCats = mappedCategories.filter(c => c.isCustom);
            set((state) => ({ categories: [...defaultCategories, ...customCats] }));
          } else {
             // Seed default categories if none exist at all in DB for this user
             const initialCats = defaultCategories.map(c => ({
               id: c.id,
               type: c.type,
               name: c.name,
               icon: c.icon,
               is_custom: false,
               order: c.order || 0,
               user_id: user.id
             }));
             await supabase.from('categories').insert(initialCats);
             set({ categories: defaultCategories });
          }

          // 2. Fetch Wallets (Seed if missing)
          const { data: wallets, error: wError } = await supabase.from('wallets').select('*').eq('user_id', user.id);
          if (wError) throw wError;

          if (wallets && wallets.length > 0) {
            set({ wallets });
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
                amount: t.amount,
                note: t.note,
                date: t.date,
                categoryId: t.category_id || t.categoryId, // Fallback if API hasn't changed
                walletId: t.wallet_id || t.walletId
            }));
            set({ transactions: mappedTransactions });
          }

        } catch (error) {
          console.error('Initial data fetch error:', error);
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
