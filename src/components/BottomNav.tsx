"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Plus, User, Banknote } from 'lucide-react';

import { cn } from '@/utils/cn';
import { useStore } from '@/store/useStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { openAddSheet } = useStore();



  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 flex justify-between items-center z-40 text-xs">
        <Link 
          href="/" 
          className={cn("flex flex-col items-center gap-1 p-2 transition-colors", pathname === '/' ? "text-primary font-medium" : "text-slate-500")}
        >
          <Home size={24} />
          <span>Home</span>
        </Link>
        
        <Link 
          href="/stats" 
          className={cn("flex flex-col items-center gap-1 p-2 transition-colors", pathname === '/stats' ? "text-primary font-medium" : "text-slate-500")}
        >
          <BarChart3 size={24} />
          <span>Analytics</span>
        </Link>

        
        <button 
          onClick={() => openAddSheet()}
          className="bg-primary text-white p-4 rounded-full -mt-8 shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>

        <Link 
          href="/loans" 
          className={cn("flex flex-col items-center gap-1 p-2 transition-colors", pathname === '/loans' ? "text-primary font-medium" : "text-slate-500")}
        >
          <Banknote size={24} />
          <span>Loans</span>
        </Link>
        
        <Link 
          href="/profile" 
          className={cn("flex flex-col items-center gap-1 p-2 transition-colors", pathname === '/profile' ? "text-primary font-medium" : "text-slate-500")}
        >
          <User size={24} />
          <span>Profile</span>
        </Link>

      </div>
    </>
  );
}
