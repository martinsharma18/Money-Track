"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate, formatMonthAndYear, addMonths } from "@/utils/date";
import bsLib from 'bikram-sambat';
import { Wallet, TrendingUp, TrendingDown, Clock, User, Calendar as CalendarIcon, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Transaction } from "@/types";

export default function Home() {
  const { transactions, wallets, settings, categories, user, hasHydrated } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

  const monthBoundaries = useMemo(() => {
    let start, end;
    if (settings.dateDisplay === 'BS') {
      const b = bsLib.toBik(selectedMonth);
      const startDay = bsLib.toGreg(b.year, b.month, 1);
      start = new Date(startDay.year, startDay.month - 1, startDay.day);
      const nextM = b.month === 12 ? 1 : b.month + 1;
      const nextY = b.month === 12 ? b.year + 1 : b.year;
      const nextMonthFirstDay = bsLib.toGreg(nextY, nextM, 1);
      end = new Date(nextMonthFirstDay.year, nextMonthFirstDay.month - 1, nextMonthFirstDay.day);
      end.setMilliseconds(-1);
    } else {
      start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
    }
    return { start, end };
  }, [selectedMonth, settings.dateDisplay]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const monthName = useMemo(() => formatMonthAndYear(selectedMonth, settings.dateDisplay), [selectedMonth, settings.dateDisplay]);

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

  const stats = useMemo(() => {
    const bal = wallets.reduce((acc, w) => acc + w.balance, 0);
    let inc = 0;
    let exp = 0;
    const { start, end } = monthBoundaries;
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d >= start && d <= end) {
        if (t.type === 'INCOME') inc += t.amount;
        else exp += t.amount;
      }
    });
    return { totalBalance: bal, income: inc, expense: exp };
  }, [wallets, transactions, monthBoundaries]);

  const changeMonth = (dir: number) => {
    setSelectedMonth(prev => addMonths(prev, dir, settings.dateDisplay));
  };


  const todayIso = new Date().toISOString().split('T')[0];
  const displayToday = useMemo(() => {
    return {
      primary: formatDisplayDate(todayIso, settings.dateDisplay),
      secondary: formatDisplayDate(todayIso, settings.dateDisplay === 'BS' ? 'AD' : 'BS')
    };
  }, [todayIso, settings.dateDisplay]);

  if (!hasHydrated) return null;

  return (
    <div className="animate-fade-in custom-scrollbar min-h-screen bg-white">
      {/* Rectangular Compact Blue Header */}
      <div className="sticky top-0 z-45 transition-all duration-300  px-0 py-0 pb-4 rounded-b-4xl rounded-[1rem]  mt- -4">
        <div className={cn(
          "shadow-2xl transition-all duration-500 overflow-hidden relative",
          "bg-gradient-to-br from-[var(--header-from)] via-[var(--header-via)] to-[var(--header-to)]",
          scrolled ? "px-4 py-2 pb-4 rounded-[1rem] " : "px-4 py-4 pb-5  rounded-[1rem]"
        )}>
          {/* Multi-layered premium glows */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Top Row: Navigation & Search */}
          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex flex-col">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Period View</p>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/15 px-2 py-1 rounded-lg">
                <button onClick={() => changeMonth(-1)} className="p-0.5 hover:bg-white/10 rounded-md transition-colors">
                  <ChevronLeft size={14} className="text-white/70" />
                </button>
                <h1 className="text-[10px] font-black min-w-[75px] text-center text-white tracking-tight">
                  {monthName}
                </h1>
                <button onClick={() => changeMonth(1)} className="p-0.5 hover:bg-white/10 rounded-md transition-colors">
                  <ChevronRight size={14} className="text-white/70" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95">
                <Search size={16} />
              </button>
              <button onClick={() => setIsCalendarOpen(true)} className="p-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all active:scale-95">
                <CalendarIcon size={16} />
              </button>
              <Link href="/profile" className="p-0.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl active:scale-90 transition-all overflow-hidden flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg p-0.5 shadow-inner flex items-center justify-center overflow-hidden">
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-[10px]" /> : <User size={16} className="text-slate-300" />}
                </div>
              </Link>
            </div>
          </div>

          {/* Floating Balance Card - Very Compact */}
          <div className={cn(
            "bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-2xl shadow-primary-dark/40 flex items-center divide-x divide-slate-100/50 relative z-10 transition-all duration-300 border border-white/40",
            scrolled ? "p-1.5 px-3" : ""
          )}>
            <div className="flex-1 pr-3">
              <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Total Balance</p>
              <p className={cn("font-black text-slate-900 leading-none truncate tracking-tight transition-all", scrolled ? "text-sm" : "text-lg")}>
                Rs {stats.totalBalance.toLocaleString()}
              </p>
            </div>

            <div className="flex-1 px-3">
              <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Income</p>
              <p className={cn("font-black text-green-600 leading-none truncate transition-all", scrolled ? "text-[11px]" : "text-sm")}>
                +{stats.income.toLocaleString()}
              </p>
            </div>

            <div className="flex-1 pl-3">
              <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Expense</p>
              <p className={cn("font-black text-orange-600 leading-none truncate transition-all", scrolled ? "text-[11px]" : "text-sm")}>
                -{stats.expense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Float Search Bar */}
        {isSearchOpen && (
          <div className="mt-2 mx-4 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-2 shadow-2xl animate-slide-down relative z-30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                autoFocus
                placeholder="Search category or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-10 text-sm outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        month={selectedMonth}
        transactions={transactions}
      />

      <div className="h-28"></div>
    </div>
  );
}

function TransactionItem({ transaction: t }: { transaction: Transaction }) {
  const { categories, wallets, openAddSheet } = useStore();
  const category = categories.find(c => c.id === t.categoryId);
  const wallet = wallets.find(w => w.id === t.walletId);
  const isInc = t.type === 'INCOME';

  return (
    <div className="p-4 flex items-center gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors" onClick={() => openAddSheet(t.id)}>
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm", isInc ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600")}>
        {category?.icon || '💰'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 truncate">{category?.name || 'Unknown'}</p>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <span>{wallet?.icon} {wallet?.name}</span>
          </p>
          {t.note && (
            <>
              <span className="text-[10px] text-slate-200">•</span>
              <p className="text-[10px] font-medium text-slate-400 truncate">{t.note}</p>
            </>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("font-black text-sm", isInc ? "text-green-500" : "text-orange-500")}>
          {isInc ? '+' : '-'} {t.amount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function CalendarModal({ isOpen, onClose, month, transactions }: { isOpen: boolean, onClose: () => void, month: Date, transactions: Transaction[] }) {
  if (!isOpen) return null;

  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getDayData = (day: number) => {
    const dStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTxs = transactions.filter(t => t.date.startsWith(dStr));
    const income = dayTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = dayTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-1.5 bg-white/10 rounded-full hover:bg-white/20">
            <X size={18} />
          </button>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Calendar Review</p>
          <h2 className="text-xl font-black">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>

        <div className="p-4 bg-white">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[10px] font-black text-slate-300 text-center py-2">{d}</div>
            ))}
            {blanks.map(b => <div key={`b-${b}`} />)}
            {days.map(d => {
              const { income, expense } = getDayData(d);
              return (
                <div key={d} className="aspect-square flex flex-col items-center justify-start rounded-xl bg-slate-50 border border-slate-100 px-0.5 py-0.5 relative overflow-hidden">
                  <span className="text-[10px] font-black text-slate-400 mb-auto">{d}</span>
                  <div className="w-full space-y-0.5 text-center pb-0.5">
                    {income > 0 && <p className="text-[7px] font-black text-green-500 leading-none truncate">+{income}</p>}
                    {expense > 0 && <p className="text-[7px] font-black text-orange-500 leading-none truncate">-{expense}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-around bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Daily In</p>
              <div className="flex items-center gap-1 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-black text-slate-800">Green</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Daily Out</p>
              <div className="flex items-center gap-1 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-xs font-black text-slate-800">Orange</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-50">
          <button onClick={onClose} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform">
            CLOSE VIEW
          </button>
        </div>
      </div>
    </div>
  );
}
