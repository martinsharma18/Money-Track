"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate, getMonthName } from "@/utils/date";
import { usePeriodView } from "@/hooks/usePeriodView";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { cn } from "@/utils/cn";
import { Search, Trash2, LayoutList, Calendar as CalendarDays, History, BarChart3 } from "lucide-react";
import TransactionCalendar from "@/components/TransactionCalendar";
import ConfirmModal from "@/components/ConfirmModal";
import { Transaction } from "@/types";

export default function StatsPage() {
  const { transactions, categories, wallets, settings, deleteTransaction, hasHydrated, openAddSheet } = useStore();
  const { monthBoundaries, monthName } = usePeriodView();
  
  const [mainView, setMainView] = useState<'STATS' | 'HISTORY'>('STATS');
  const [statsPeriod, setStatsPeriod] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');
  
  // History specific states
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [historyMode, setHistoryMode] = useState<'LIST' | 'CALENDAR'>('LIST');

  // Memoized Data for Stats
  const { monthlyData, pieData, weeklyData } = useMemo(() => {
    const today = new Date();
    
    // Monthly Data (Last 6 months)
    const monthlyMap = new Map();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
      monthlyMap.set(key, { 
        name: getMonthName(d.toISOString(), settings.dateDisplay), 
        income: 0, 
        expense: 0,
        sortKey: d.getTime()
      });
    }

    // Pie Data (Selected Month Expenses)
    const { start: startOfMonth, end: endOfMonth } = monthBoundaries;
    const categoryTotals = new Map<string, { value: number, name: string, color: string }>();

    // Weekly Data (Daily spending this week)
    const weeklyMap = new Map();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday start
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0,0,0,0);
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        weeklyMap.set(d.toISOString().split('T')[0], {
            name: dayStr,
            expense: 0
        });
    }

    // Aggregate
    transactions.forEach(t => {
      const d = new Date(t.date);
      
      // Monthly aggregation
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
      if (monthlyMap.has(mKey)) {
        const m = monthlyMap.get(mKey);
        if (t.type === 'INCOME') m.income += t.amount;
        else m.expense += t.amount;
      }

      // This Month Pie (uses Period View selection)
      if (d >= startOfMonth && d <= endOfMonth && t.type === 'EXPENSE') {
        const c = categories.find(cat => cat.id === t.categoryId);
        if (c) {
          if (!categoryTotals.has(c.id)) {
            categoryTotals.set(c.id, { value: 0, name: c.name, color: `hsl(${Math.random()*360}, 70%, 50%)` }); 
          }
          categoryTotals.get(c.id)!.value += t.amount;
        }
      }

      // This week Line
      if (d >= startOfWeek) {
          const dateStr = t.date.split('T')[0];
          if (weeklyMap.has(dateStr) && t.type === 'EXPENSE') {
              weeklyMap.get(dateStr).expense += t.amount;
          }
      }
    });

    const definedColors = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#eab308', '#06b6d4'];
    let colorIdx = 0;
    const finalPieData = Array.from(categoryTotals.values()).map(x => ({ ...x, color: definedColors[colorIdx++ % definedColors.length]}));

    return {
      monthlyData: Array.from(monthlyMap.values()).sort((a, b) => a.sortKey - b.sortKey),
      pieData: finalPieData.sort((a, b) => b.value - a.value),
      weeklyData: Array.from(weeklyMap.values()),
    };
  }, [transactions, categories, settings.dateDisplay, monthBoundaries]);

  // Memoized Data for History
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((p: any) => (
             <p key={p.dataKey} style={{ color: p.color }} className="text-sm font-medium">
               {p.name}: Rs {p.value.toLocaleString()}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 max-w-lg mx-auto pb-32 animate-fade-in custom-scrollbar">
      <div className="px-1 flex justify-between items-center">
        <h1 className="text-xl font-black font-sans tracking-tight">Analytics</h1>
        <div className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-lg uppercase tracking-widest">
          {monthName}
        </div>
      </div>
      
      {/* Top Main Toggle */}

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setMainView('STATS')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
            mainView === 'STATS' 
              ? "bg-white dark:bg-slate-800 shadow-md text-primary" 
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <BarChart3 size={16} />
          Stats
        </button>
        <button
          onClick={() => setMainView('HISTORY')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
            mainView === 'HISTORY' 
              ? "bg-white dark:bg-slate-800 shadow-md text-primary" 
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <History size={16} />
          History
        </button>
      </div>

      {mainView === 'STATS' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Sub-toggle for Monthly/Weekly */}
          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl w-full max-w-[200px] mx-auto">
            <button
              onClick={() => setStatsPeriod('MONTHLY')}
              className={cn("flex-1 py-1 text-[10px] font-bold rounded-lg transition-all", statsPeriod === 'MONTHLY' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400")}
            >
              Monthly
            </button>
            <button
              onClick={() => setStatsPeriod('WEEKLY')}
              className={cn("flex-1 py-1 text-[10px] font-bold rounded-lg transition-all", statsPeriod === 'WEEKLY' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400")}
            >
              Weekly
            </button>
          </div>

          {statsPeriod === 'MONTHLY' ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">Income vs Expense</h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="income" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expense Breakdown</h3>
                   <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{monthName}</span>
                </div>
                {pieData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5}>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-16">
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <BarChart3 size={24} />
                     </div>
                     <p className="text-slate-400 text-xs font-medium">No expenses for {monthName}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400">Daily Spending This Week</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--expense)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Transactions for {monthName}</h2>
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setHistoryMode('LIST')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  historyMode === 'LIST' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"
                )}
              >
                <LayoutList size={14} />
              </button>
              <button 
                onClick={() => setHistoryMode('CALENDAR')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  historyMode === 'CALENDAR' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"
                )}
              >
                <CalendarDays size={14} />
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search notes or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 ring-primary/10 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {(['ALL', 'EXPENSE', 'INCOME'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2",
                    typeFilter === f 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
                  )}
                >
                  {f === 'ALL' ? 'All Records' : f}
                </button>
              ))}
            </div>
          </div>

          {/* History Content */}
          <div className="space-y-3 min-h-[300px]">
            {historyMode === 'LIST' ? (
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No matching records</p>
                  </div>
                ) : (
                  filteredTransactions.map(t => (
                    <TransactionCard key={t.id} transaction={t} onDelete={() => setTxToDelete(t.id)} />
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-2 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <TransactionCalendar />
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
           if (txToDelete) {
             deleteTransaction(txToDelete);
             setTxToDelete(null);
           }
        }}
        title="Delete Record?"
        message="This will permanently remove the transaction and update your wallet balance."
      />
    </div>
  );
}

function TransactionCard({ transaction: t, onDelete }: { transaction: Transaction, onDelete: () => void }) {
  const { categories, wallets, openAddSheet, settings } = useStore();
  const category = categories.find(c => c.id === t.categoryId);
  const wallet = wallets.find(w => w.id === t.walletId);
  const isInc = t.type === 'INCOME';

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer group"
      onClick={() => openAddSheet(t.id)}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110", 
        isInc ? "bg-green-50 dark:bg-green-950/20 text-green-600" : "bg-orange-50 dark:bg-orange-950/20 text-orange-600"
      )}>
        {category?.icon || '💰'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
           <p className="font-black text-sm text-slate-800 dark:text-slate-200 truncate">{category?.name || 'Unknown'}</p>
           <p className={cn("font-black text-sm", isInc ? "text-green-600" : "text-rose-600")}>
             {isInc ? '+' : '-'} {t.amount.toLocaleString()}
           </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              {wallet?.icon} {wallet?.name}
            </span>
            <span className="text-[10px] font-medium text-slate-400 truncate">{t.note || 'No description'}</span>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">
               {formatDisplayDate(t.date, settings.dateDisplay)}
             </span>
             <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
