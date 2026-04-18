"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate, getMonthName } from "@/utils/date";
import { usePeriodView } from "@/hooks/usePeriodView";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { cn } from "@/utils/cn";

export default function StatsPage() {
  const { transactions, categories, settings, hasHydrated } = useStore();
  const { monthBoundaries } = usePeriodView();
  const [view, setView] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');

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

      // This Month Pie (now uses Period View selection)
      if (d >= startOfMonth && d <= endOfMonth && t.type === 'EXPENSE') {
        const c = categories.find(cat => cat.id === t.categoryId);
        if (c) {
          if (!categoryTotals.has(c.id)) {
            categoryTotals.set(c.id, { value: 0, name: c.name, color: `hsl(${Math.random()*360}, 70%, 50%)` }); // Random distinct colors, ideally we'd map
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
      <h1 className="text-xl font-bold font-sans px-1">Analytics</h1>
      
      {/* Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-xs mx-auto">
        <button
          onClick={() => setView('MONTHLY')}
          className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", view === 'MONTHLY' ? "bg-white shadow-sm text-primary" : "text-slate-500")}
        >
          Monthly
        </button>
        <button
          onClick={() => setView('WEEKLY')}
          className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", view === 'WEEKLY' ? "bg-white shadow-sm text-primary" : "text-slate-500")}
        >
          Weekly
        </button>
      </div>

      {view === 'MONTHLY' ? (
        <div className="space-y-4">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-slate-400">Income vs Expense</h3>
            <div className="h-56 w-full">
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

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-slate-400">Expense Breakdown</h3>
            {pieData.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-10 text-xs font-medium">No expenses yet</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold mb-4 uppercase tracking-wider text-slate-400">Daily Spending</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--expense)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
