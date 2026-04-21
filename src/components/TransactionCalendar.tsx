"use client";

import { useStore } from "@/store/useStore";
import { usePeriodView } from "@/hooks/usePeriodView";
import { getDaysInMonth, getFirstDayOfMonth } from "@/utils/date";
import { cn } from "@/utils/cn";
import { useMemo } from "react";
import bsLib from 'bikram-sambat';

export default function TransactionCalendar() {
  const { transactions, settings, openAddSheet } = useStore();
  const { selectedMonthDate, monthBoundaries } = usePeriodView();
  
  const mode = settings.dateDisplay;
  const year = mode === 'BS' ? monthBoundaries.start.getFullYear() : selectedMonthDate.getFullYear();
  // Simplified year/month for the grid
  const currentMonthData = useMemo(() => {
    if (mode === 'BS') {
       const b = bsLib.toBik(selectedMonthDate);
       return { year: b.year, month: b.month };
    } else {
       return { year: selectedMonthDate.getFullYear(), month: selectedMonthDate.getMonth() + 1 };
    }
  }, [selectedMonthDate, mode]);

  const days = useMemo(() => {
    const count = getDaysInMonth(currentMonthData.year, currentMonthData.month, mode);
    const firstDay = getFirstDayOfMonth(currentMonthData.year, currentMonthData.month, mode);
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= count; i++) arr.push(i);
    return arr;
  }, [currentMonthData, mode]);

  const dailyTotals = useMemo(() => {
     const totals: Record<number, { inc: number, exp: number }> = {};
     transactions.forEach(t => {
        const d = new Date(t.date);
        let day: number | null = null;
        if (mode === 'BS') {
           const b = bsLib.toBik(d);
           if (b.year === currentMonthData.year && b.month === currentMonthData.month) day = b.day;
        } else {
           if (d.getFullYear() === currentMonthData.year && d.getMonth() + 1 === currentMonthData.month) day = d.getDate();
        }
        
        if (day) {
           if (!totals[day]) totals[day] = { inc: 0, exp: 0 };
           if (t.type === 'INCOME') totals[day].inc += t.amount;
           else totals[day].exp += t.amount;
        }
     });
     return totals;
  }, [transactions, currentMonthData, mode]);

  const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 shadow-xl border border-slate-100 dark:border-slate-800 animate-slide-up">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">{w}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={i} className="aspect-square" />;
          
          const totals = dailyTotals[day];
          
          return (
            <div 
              key={i} 
              className="aspect-square border border-slate-50 dark:border-slate-800/50 rounded-xl p-1 flex flex-col justify-between overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{day}</span>
              {totals && (
                <div className="flex flex-col gap-0.5">
                  {totals.inc > 0 && (
                    <div className="h-1 w-full bg-emerald-400 rounded-full opacity-80" title={`In: ${totals.inc}`} />
                  )}
                  {totals.exp > 0 && (
                    <div className="h-1 w-full bg-rose-400 rounded-full opacity-80" title={`Out: ${totals.exp}`} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4 justify-center">
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-emerald-400" />
           <span className="text-[9px] font-black text-slate-400 uppercase">Income</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-2 h-2 rounded-full bg-rose-400" />
           <span className="text-[9px] font-black text-slate-400 uppercase">Expense</span>
         </div>
      </div>
    </div>
  );
}
