"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, Plus, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useStore } from '@/store/useStore';

export default function BottomNav() {
  const pathname = usePathname();
  const { openAddSheet } = useStore();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/stats', icon: PieChart, label: 'Stats' },
  ];

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
          <PieChart size={24} />
          <span>Stats</span>
        </Link>
        
        <button 
          onClick={() => openAddSheet()}
          className="bg-primary text-white p-4 rounded-full -mt-8 shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>

        <Link 
          href="/transactions" 
          className={cn("flex flex-col items-center gap-1 p-2 transition-colors", pathname === '/transactions' ? "text-primary font-medium" : "text-slate-500")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>All</span>
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
