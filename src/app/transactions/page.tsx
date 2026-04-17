"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate } from "@/utils/date";
import { Search, Trash2, Pencil } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { Transaction } from "@/types";

export default function TransactionsPage() {
  const { transactions, categories, wallets, settings, deleteTransaction, hasHydrated } = useStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const matchesSearch = 
        (t.note?.toLowerCase().includes(search.toLowerCase())) || 
        (cat?.name.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categories]);

  if (!hasHydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto pb-32 animate-fade-in custom-scrollbar">
      <h1 className="text-2xl font-bold font-sans">All Transactions</h1>
      
      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search notes or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                typeFilter === f 
                  ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" 
                  : "bg-card border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No transactions found</p>
        ) : (
          filteredTransactions.map(t => (
            <TransactionCard key={t.id} transaction={t} onDelete={() => deleteTransaction(t.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionCard({ transaction: t, onDelete }: { transaction: Transaction, onDelete: () => void }) {
  const { categories, wallets, settings, openAddSheet } = useStore();
  const category = categories.find(c => c.id === t.categoryId);
  const wallet = wallets.find(w => w.id === t.walletId);
  const isInc = t.type === 'INCOME';

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div 
      className="bg-card rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:border-slate-200 transition-colors"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0", isInc ? "bg-green-50 dark:bg-green-950/30" : "bg-orange-50 dark:bg-orange-950/30")}>
        {category?.icon || '💰'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">{category?.name || 'Unknown'}</p>
        <p className="text-sm text-slate-500 truncate">{t.note || 'No note'}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
          <span>{wallet?.icon} {wallet?.name}</span>
          <span className="opacity-50">•</span>
          <span>{formatDisplayDate(t.date, settings.dateDisplay)}</span>
        </p>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end justify-between h-full">
        <p className={cn("font-bold", isInc ? "text-income" : "text-expense")}>
          {isInc ? '+' : '-'}Rs {t.amount.toLocaleString()}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); openAddSheet(t.id); }}
          className="inline-flex items-center gap-0.5 text-[10px] text-primary mt-0.5 hover:underline"
        >
          <Pencil size={10} /> edit
        </button>
        
        {confirmDelete ? (
           <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
             <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-500 px-2 py-1">Cancel</button>
             <button onClick={onDelete} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold">Confirm</button>
           </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} 
            className="flex items-center gap-0.5 text-[10px] text-red-500 mt-0.5 hover:text-red-700"
          >
            <Trash2 size={10} /> delete
          </button>
        )}
      </div>
    </div>
  );
}
