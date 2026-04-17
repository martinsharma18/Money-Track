"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate } from "@/utils/date";
import { Wallet, TrendingUp, TrendingDown, LayoutGrid, Clock, Pencil } from "lucide-react";
import { cn } from "@/utils/cn";
import { useMemo } from "react";
import Link from "next/link";
import { Transaction } from "@/types";

export default function Home() {
  const { transactions, wallets, settings, categories, hasHydrated } = useStore();

  const todayIso = new Date().toISOString().split('T')[0];
  const bsDate = formatDisplayDate(todayIso, 'BS');
  const adDate = formatDisplayDate(todayIso, 'AD');

  // Stats
  const { totalBalance, thisMonthIncome, thisMonthExpense, savings } = useMemo(() => {
    // Balances
    const bal = wallets.reduce((acc, w) => acc + w.balance, 0);
    
    // Period dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Transactions
    let inc = 0;
    let exp = 0;
    
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= startOfMonth) {
        if (t.type === 'INCOME') inc += t.amount;
        else exp += t.amount;
      }
    });

    return {
      totalBalance: bal,
      thisMonthIncome: inc,
      thisMonthExpense: exp,
      savings: inc - exp
    };
  }, [transactions, wallets]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [transactions]);

  if (!hasHydrated) return null;

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in custom-scrollbar">
      {/* Header section with Dates */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            {settings.dateDisplay === 'BS' ? adDate : bsDate}
          </p>
          <h1 className="text-2xl font-bold font-sans">
            {settings.dateDisplay === 'BS' ? bsDate : adDate}
          </h1>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold shrink-0">
          {settings.dateDisplay === 'BS' ? 'Nep Calendar' : 'Gregorian'}
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={120} className="-mr-8 -mt-8" /></div>
        <p className="text-blue-100 font-medium mb-1">Total Balance</p>
        <h2 className="text-4xl font-bold mb-6">Rs {totalBalance.toLocaleString()}</h2>
        
        <div className="flex gap-4">
          <div className="bg-white/20 rounded-2xl p-3 flex-1 flex items-center gap-3 backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-full"><TrendingUp size={16} /></div>
            <div>
              <p className="text-[10px] text-blue-100 uppercase tracking-wider">Income</p>
              <p className="font-bold">Rs {thisMonthIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-2xl p-3 flex-1 flex items-center gap-3 backdrop-blur-sm">
            <div className="bg-white/20 p-2 rounded-full"><TrendingDown size={16} /></div>
            <div>
              <p className="text-[10px] text-blue-100 uppercase tracking-wider">Expense</p>
              <p className="font-bold">Rs {thisMonthExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><LayoutGrid size={18} /> My Wallets</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {wallets.map(w => (
            <div key={w.id} className="bg-card shrink-0 w-32 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">{w.icon}</span>
              <p className="text-sm font-medium text-slate-500">{w.name}</p>
              <p className="font-bold text-lg text-foreground">Rs {w.balance.toLocaleString()}</p>
            </div>
          ))}
          {/* Add Wallet Button could go here */}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={18} /> Recent</h3>
          <Link href="/transactions" className="text-sm text-primary font-medium">See All</Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No transactions yet</p>
            <p className="text-sm text-slate-400">Add an expense to get started</p>
          </div>
        ) : (
          <div className="bg-card rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {recentTransactions.map(t => <TransactionItem key={t.id} transaction={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionItem({ transaction: t }: { transaction: Transaction }) {
  const { categories, wallets, settings, openAddSheet } = useStore();
  const category = categories.find(c => c.id === t.categoryId);
  const wallet = wallets.find(w => w.id === t.walletId);
  const isInc = t.type === 'INCOME';

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl", isInc ? "bg-green-50 dark:bg-green-950/30" : "bg-orange-50 dark:bg-orange-950/30")}>
        {category?.icon || '💰'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">{category?.name || 'Unknown'}</p>
        <p className="text-sm text-slate-500 truncate flex items-center gap-1">
          <span>{wallet?.icon} {wallet?.name}</span>
          <span className="opacity-50">•</span>
          <span>{formatDisplayDate(t.date, settings.dateDisplay)}</span>
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("font-bold", isInc ? "text-income" : "text-expense")}>
          {isInc ? '+' : '-'}Rs {t.amount.toLocaleString()}
        </p>
        <button
          onClick={() => openAddSheet(t.id)}
          className="inline-flex items-center gap-0.5 text-[10px] text-primary mt-0.5 hover:underline"
        >
          <Pencil size={10} /> edit
        </button>
      </div>
    </div>
  );
}
