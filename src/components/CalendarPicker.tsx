"use client";

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getDaysInMonth, getFirstDayOfMonth, BS_MONTHS } from '@/utils/date';
import bsLib from 'bikram-sambat';

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  mode: 'BS' | 'AD';
  onClose: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarPicker({ value, onChange, mode, onClose }: CalendarPickerProps) {
  const initialDate = useMemo(() => new Date(value), [value]);
  
  // Current view state (year/month being displayed)
  const [viewState, setViewState] = useState(() => {
    if (mode === 'BS') {
      const b = bsLib.toBik(initialDate);
      return { year: b.year, month: b.month };
    } else {
      return { year: initialDate.getFullYear(), month: initialDate.getMonth() + 1 };
    }
  });

  const days = useMemo(() => {
    const count = getDaysInMonth(viewState.year, viewState.month, mode);
    const firstDay = getFirstDayOfMonth(viewState.year, viewState.month, mode);
    
    const arr = [];
    // Padding
    for (let i = 0; i < firstDay; i++) arr.push(null);
    // Days
    for (let i = 1; i <= count; i++) arr.push(i);
    
    return arr;
  }, [viewState, mode]);

  const handleDaySelect = (day: number) => {
    let selectedDate: Date;
    if (mode === 'BS') {
      const g = bsLib.toGreg(viewState.year, viewState.month, day);
      selectedDate = new Date(g.year, g.month - 1, g.day);
    } else {
      selectedDate = new Date(viewState.year, viewState.month - 1, day);
    }
    onChange(selectedDate.toISOString().split('T')[0]);
    onClose();
  };

  const changeMonth = (dir: number) => {
    setViewState(prev => {
      let nm = prev.month + dir;
      let ny = prev.year;
      if (nm > 12) { nm = 1; ny++; }
      if (nm < 1) { nm = 12; ny--; }
      return { year: ny, month: nm };
    });
  };

  const monthName = mode === 'BS' ? BS_MONTHS[viewState.month - 1] : new Date(viewState.year, viewState.month - 1).toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">{viewState.year}</span>
             <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{monthName}</span>
          </div>
          <div className="flex items-center gap-1">
             <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
               <ChevronLeft size={16} />
             </button>
             <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
               <ChevronRight size={16} />
             </button>
             <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mx-1" />
             <button onClick={onClose} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
               <X size={16} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="text-center text-[9px] font-black text-slate-400 uppercase">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            
            const isToday = (() => {
               const today = new Date();
               if (mode === 'BS') {
                 const b = bsLib.toBik(today);
                 return b.year === viewState.year && b.month === viewState.month && b.day === day;
               } else {
                 return today.getFullYear() === viewState.year && today.getMonth() + 1 === viewState.month && today.getDate() === day;
               }
            })();

            const isSelected = (() => {
               const sel = new Date(value);
               if (mode === 'BS') {
                 const b = bsLib.toBik(sel);
                 return b.year === viewState.year && b.month === viewState.month && b.day === day;
               } else {
                 return sel.getFullYear() === viewState.year && sel.getMonth() + 1 === viewState.month && sel.getDate() === day;
               }
            })();

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDaySelect(day)}
                className={cn(
                  "aspect-square flex items-center justify-center text-xs font-bold rounded-[10px] transition-all active:scale-90",
                  isSelected 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : isToday 
                       ? "bg-primary/10 text-primary border border-primary/20" 
                       : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
