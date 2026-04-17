"use client";

import { useStore } from "@/store/useStore";
import { formatDisplayDate, getMonthName } from "@/utils/date";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { cn } from "@/utils/cn";

export default function StatsPage() {
  const { transactions, categories, settings, hasHydrated } = useStore();
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

    // Pie Data (This Month Expenses)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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

      // This Month Pie
      if (d >= startOfMonth && t.type === 'EXPENSE') {
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
  }, [transactions, categories, settings.dateDisplay]);

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
    <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto pb-32 animate-fade-in custom-scrollbar">
      <h1 className="text-2xl font-bold font-sans mb-2">Analytics</h1>
      
      {/* Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full max-w-xs mx-auto">
        <button
          onClick={() => setView('MONTHLY')}
          className={cn("flex-1 py-1.5 text-sm font-medium rounded-lg transition-all", view === 'MONTHLY' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500")}
        >
          Monthly
        </button>
        <button
          onClick={() => setView('WEEKLY')}
          className={cn("flex-1 py-1.5 text-sm font-medium rounded-lg transition-all", view === 'WEEKLY' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500")}
        >
          Weekly
        </button>
      </div>

      {view === 'MONTHLY' ? (
        <div className="space-y-6">
          {/* Bar Chart */}
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold mb-4">Income vs Expense (6 Months)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="var(--expense)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold mb-4">Expense Breakdown (This Month)</h3>
            {pieData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-10">No expenses this month</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Line Chart */}
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold mb-4">Daily Spending (This Week)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="expense" name="Expense" stroke="var(--expense)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
