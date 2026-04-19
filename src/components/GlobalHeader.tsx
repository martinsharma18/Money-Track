"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate } from "@/utils/date";
import { usePeriodView } from "@/hooks/usePeriodView";
import { Wallet, Search, Calendar as CalendarIcon, User, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalHeader() {
  const { user, wallets, transactions, settings, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useStore();
  const { monthName, monthBoundaries, changeMonth } = usePeriodView();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Early return must happen AFTER all hooks
  if (pathname === '/profile') return null;

  return (
    <div className="sticky top-0 z-45 transition-all duration-300 px-0 py-0 pb-4 rounded-b-4xl rounded-[1rem] mt- -4 max-w-lg mx-auto">
      <div className={cn(
        "shadow-2xl transition-all duration-500 overflow-hidden relative",
        "bg-gradient-to-br from-[var(--header-from)] via-[var(--header-via)] to-[var(--header-to)]",
        scrolled ? "px-4 py-2 pb-4 rounded-[1rem] " : "px-4 py-4 pb-5 rounded-[1rem]"
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
            <Link href="/profile" className="p-0.5 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl active:scale-90 transition-all overflow-hidden flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-lg p-0.5 shadow-inner flex items-center justify-center overflow-hidden">
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-[10px]" /> : <User size={16} className="text-slate-300" />}
              </div>
            </Link>
          </div>
        </div>

        {/* Floating Balance Card - Very Compact */}
        <div className={cn(
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-3 shadow-2xl shadow-primary-dark/40 flex items-center divide-x divide-slate-100/50 dark:divide-slate-800 relative z-10 transition-all duration-300 border border-white/40 dark:border-white/5",
          scrolled ? "p-1.5 px-3" : ""
        )}>
          <div className="flex-1 pr-3">
            <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1">Total Balance</p>
            <p className={cn("font-black text-slate-900 dark:text-white leading-none truncate tracking-tight transition-all", scrolled ? "text-sm" : "text-lg")}>
              <span className="text-slate-300 dark:text-slate-600 mr-0.5">Rs.</span>
              {stats.totalBalance.toLocaleString()}
            </p>
          </div>
          
          <div className={cn("flex flex-1 justify-between pl-3 transition-all", scrolled ? "gap-2" : "gap-4")}>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp size={8} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">In</p>
              </div>
              <p className={cn("font-bold text-slate-700 dark:text-slate-300 leading-none truncate", scrolled ? "text-[10px]" : "text-xs")}>
                {stats.income.toLocaleString()}
              </p>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-3 h-3 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <TrendingDown size={8} className="text-rose-600 dark:text-rose-400" />
                </div>
                <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Out</p>
              </div>
              <p className={cn("font-bold text-slate-700 dark:text-slate-300 leading-none truncate", scrolled ? "text-[10px]" : "text-xs")}>
                {stats.expense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Float Search Bar */}
      {isSearchOpen && (
        <div className="mt-2 mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-2xl animate-slide-down relative z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl py-2 pl-9 pr-10 text-sm outline-none focus:border-primary transition-all text-slate-900 dark:text-white"
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
  );
}
