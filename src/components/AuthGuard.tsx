"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Wallet } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, login, hasHydrated } = useStore();
  const [name, setName] = useState("");

  if (!hasHydrated) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50">
        <div className="bg-card w-full max-w-sm rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Wallet size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans">Money Track</h1>
            <p className="text-slate-500 mt-2">Your mobile-first personal finance tracker</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) login({ id: 'u1', name: name.trim(), email: '' });
          }} className="space-y-4 pt-4">
            <input 
              type="text" 
              placeholder="What's your name?" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none focus:border-primary border-2 border-transparent"
              required
            />
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors">
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
