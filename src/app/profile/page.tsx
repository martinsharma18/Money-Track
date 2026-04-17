"use client";

import { useStore } from "@/store/useStore";
import { User, LogOut, Settings, Wallet, Tag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, settings, wallets, categories, updateUser, updateSettings, logout, addWallet, deleteWallet, addCategory, deleteCategory, hasHydrated } = useStore();
  const [newWallet, setNewWallet] = useState("");
  const [newWalletIcon, setNewWalletIcon] = useState("💳");
  
  const [newCat, setNewCat] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [newCatType, setNewCatType] = useState<'EXPENSE'|'INCOME'>('EXPENSE');

  if (!hasHydrated || !user) return null;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const handleDisplayToggle = (view: 'BS' | 'AD') => {
    updateSettings({ dateDisplay: view });
    toast.success(`Date display set to ${view}`);
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallet) return;
    addWallet({ name: newWallet, icon: newWalletIcon, balance: 0 });
    setNewWallet("");
    toast.success("Wallet added");
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat) return;
    addCategory({ name: newCat, icon: newCatIcon, type: newCatType });
    setNewCat("");
    toast.success("Category added");
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-lg mx-auto pb-32 animate-fade-in custom-scrollbar">
      {/* Profile Header */}
      <div className="flex items-center gap-4 bg-card p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-slate-500">Personal Finance Nerd</p>
        </div>
        <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="font-bold flex items-center gap-2"><Settings size={18} /> Settings</h2>
        
        <div className="bg-card p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="font-medium">Date Display</p>
            <p className="text-xs text-slate-500">Choose between AD and BS (Nepali Calendar)</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleDisplayToggle('BS')}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-lg transition-all", settings.dateDisplay === 'BS' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500")}
            >BS
            </button>
            <button
              onClick={() => handleDisplayToggle('AD')}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-lg transition-all", settings.dateDisplay === 'AD' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500")}
            >AD
            </button>
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div className="space-y-4">
        <h2 className="font-bold flex items-center gap-2"><Wallet size={18} /> Manage Wallets</h2>
        
        <div className="bg-card rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {wallets.map(w => (
            <div key={w.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.icon}</span>
                <span className="font-medium">{w.name}</span>
              </div>
              {wallets.length > 1 && (
                <button onClick={() => deleteWallet(w.id)} className="text-slate-400 hover:text-red-500 text-sm">Delete</button>
              )}
            </div>
          ))}
          
          <form onSubmit={handleAddWallet} className="p-4 flex gap-2">
            <input type="text" value={newWalletIcon} onChange={e => setNewWalletIcon(e.target.value)} className="w-12 bg-slate-50 dark:bg-slate-800 rounded-xl text-center outline-none" maxLength={2} />
            <input type="text" value={newWallet} onChange={e => setNewWallet(e.target.value)} placeholder="New wallet name" className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 outline-none text-sm" />
            <button type="submit" disabled={!newWallet} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">Add</button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="font-bold flex items-center gap-2"><Tag size={18} /> Custom Categories</h2>
        
        <div className="bg-card rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {categories.filter(c => c.isCustom).length === 0 ? (
            <p className="p-4 text-center text-slate-500 text-sm">No custom categories added yet</p>
          ) : (
            categories.filter(c => c.isCustom).map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    <span className={cn("text-[10px] font-bold", c.type === 'EXPENSE' ? "text-expense" : "text-income")}>{c.type}</span>
                  </div>
                </div>
                <button onClick={() => deleteCategory(c.id)} className="text-slate-400 hover:text-red-500 text-sm">Delete</button>
              </div>
            ))
          )}
          
          <form onSubmit={handleAddCategory} className="p-4 flex flex-col gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full mb-2">
              <button type="button" onClick={() => setNewCatType('EXPENSE')} className={cn("flex-1 py-1 text-xs font-medium rounded-lg transition-all", newCatType === 'EXPENSE' ? "bg-white dark:bg-slate-700 shadow-sm text-expense" : "text-slate-500")}>Expense</button>
              <button type="button" onClick={() => setNewCatType('INCOME')} className={cn("flex-1 py-1 text-xs font-medium rounded-lg transition-all", newCatType === 'INCOME' ? "bg-white dark:bg-slate-700 shadow-sm text-income" : "text-slate-500")}>Income</button>
            </div>
            <div className="flex gap-2">
              <input type="text" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="w-12 bg-slate-50 dark:bg-slate-800 rounded-xl text-center outline-none" maxLength={2} />
              <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 outline-none text-sm" />
              <button type="submit" disabled={!newCat} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">Add</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
