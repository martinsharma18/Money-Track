"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate } from "@/utils/date";
import { usePeriodView } from "@/hooks/usePeriodView";
import { Wallet, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { useMemo } from "react";
import { Transaction } from "@/types";

export default function Home() {
  const { transactions, categories, settings, hasHydrated, searchQuery } = useStore();
  const { monthName, monthBoundaries } = usePeriodView();

  const filteredTransactions = useMemo(() => {
    const { start, end } = monthBoundaries;
    return transactions.filter(t => {
      const d = new Date(t.date);
      const matchesMonth = d >= start && d <= end;
      if (!searchQuery) return matchesMonth;
      const cat = categories.find(c => c.id === t.categoryId);
      return matchesMonth && (cat?.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.note?.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [transactions, monthBoundaries, searchQuery, categories]);

  if (!hasHydrated) return null;

  return (
    <div className="animate-fade-in custom-scrollbar">
      <div className="p-4 space-y-6">
        {/* Activity Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              {searchQuery ? 'Search Results' : 'Transactions'}
            </h3>
            {searchQuery && (
              <span className="text-[10px] font-bold text-slate-400">{filteredTransactions.length} found</span>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none grayscale">
                <Wallet size={200} />
              </div>
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm relative z-10">
                <Clock className="text-slate-200" size={24} />
              </div>
              <p className="text-slate-400 text-sm font-bold relative z-10">
                {searchQuery ? "No matches found" : "No transactions in " + monthName}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(
                filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .reduce((acc, t) => {
                    const dateKey = t.date.split('T')[0];
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(t);
                    return acc;
                  }, {} as Record<string, typeof filteredTransactions>)
              ).map(([date, txs]) => {
                const dailyExpense = txs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
                const d = new Date(date);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <div key={date} className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{formatDisplayDate(date, settings.dateDisplay)}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dayName}</span>
                      </div>
                      {dailyExpense > 0 && (
                        <span className="text-[10px] font-black text-slate-400">Total: Rs {dailyExpense.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-50">
                      {txs.map(t => <TransactionItem key={t.id} transaction={t} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ transaction: t }: { transaction: Transaction }) {
  const { categories, openAddSheet } = useStore();
  const c = categories.find(cat => cat.id === t.categoryId);
  if (!c) return null;

  return (
    <div 
      onClick={() => openAddSheet(t.id)}
      className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-[1rem] flex items-center justify-center text-xl shadow-sm",
          t.type === 'INCOME' ? "bg-emerald-50" : "bg-rose-50"
        )}>
          {c.icon}
        </div>
        <div>
          <p className="font-bold text-slate-800 tracking-tight leading-tight mb-0.5">{c.name}</p>
          {t.note && <p className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{t.note}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-black tracking-tight",
          t.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
        )}>
          {t.type === 'INCOME' ? '+' : '-'}Rs {t.amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
