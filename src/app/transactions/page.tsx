"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate } from "@/utils/date";
import { Search, Trash2, Pencil } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { Transaction } from "@/types";
import { usePeriodView } from "@/hooks/usePeriodView";
import ConfirmModal from "@/components/ConfirmModal";
import TransactionCalendar from "@/components/TransactionCalendar";
import { LayoutList, Calendar as CalendarDays } from "lucide-react";

export default function TransactionsPage() {
  const { transactions, categories, wallets, settings, deleteTransaction, hasHydrated } = useStore();
  const { monthName, monthBoundaries } = usePeriodView();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  const filteredTransactions = useMemo(() => {
    const { start, end } = monthBoundaries;
    return transactions.filter(t => {
      const d = new Date(t.date);
      const matchesMonth = d >= start && d <= end;
      if (!matchesMonth) return false;

      const cat = categories.find(c => c.id === t.categoryId);
      const matchesSearch = 
        (t.note?.toLowerCase().includes(search.toLowerCase())) || 
        (cat?.name.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter, categories, monthBoundaries]);

  if (!hasHydrated) return null;

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-lg mx-auto pb-32 animate-fade-in custom-scrollbar">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-xl font-bold font-sans">Transactions</h1>
        
        {/* View Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('LIST')}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === 'LIST' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"
            )}
          >
            <LayoutList size={14} />
          </button>
          <button 
            onClick={() => setViewMode('CALENDAR')}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              viewMode === 'CALENDAR' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"
            )}
          >
            <CalendarDays size={14} />
          </button>
        </div>
      </div>
      
      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex gap-1.5 px-0.5">
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold transition-colors uppercase tracking-wider",
                typeFilter === f 
                  ? "bg-primary text-white" 
                  : "bg-white border border-slate-100 text-slate-500"
              )}
            >
              {f === 'ALL' ? 'Everything' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {viewMode === 'LIST' ? (
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-xs">No transactions found</p>
            ) : (
              filteredTransactions.map(t => (
                <TransactionCard key={t.id} transaction={t} onDelete={() => setTxToDelete(t.id)} />
              ))
            )}
          </div>
        ) : (
          <TransactionCalendar />
        )}
      </div>

      <ConfirmModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => txToDelete && deleteTransaction(txToDelete)}
        title="Delete Transaction?"
        message="Are you sure you want to remove this record? This will also revert the balance change in your wallet."
      />
    </div>
  );
}

function TransactionCard({ transaction: t, onDelete }: { transaction: Transaction, onDelete: () => void }) {
  const { categories, wallets, settings, openAddSheet } = useStore();
  const category = categories.find(c => c.id === t.categoryId);
  const wallet = wallets.find(w => w.id === t.walletId);
  const isInc = t.type === 'INCOME';

  return (
    <div 
      className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 active:scale-[0.98] transition-all"
      onClick={() => openAddSheet(t.id)}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0", isInc ? "bg-green-50" : "bg-orange-50")}>
        {category?.icon || '💰'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground/80 truncate">{category?.name || 'Unknown'}</p>
        <div className="flex items-center gap-1.5 truncate">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>{wallet?.icon} {wallet?.name}</span>
          </p>
          <span className="text-[10px] text-slate-200">•</span>
          <p className="text-[10px] text-slate-400 font-medium truncate">{t.note || 'No note'}</p>
        </div>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
        <p className={cn("font-bold text-sm", isInc ? "text-income/90" : "text-expense/90")}>
          {isInc ? '+' : '-'} {t.amount.toLocaleString()}
        </p>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }} 
          className="text-slate-200 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
