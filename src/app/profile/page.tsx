"use client";

import { useStore } from "@/store/useStore";
import { User, LogOut, Settings, Wallet, Tag, X, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProfilePage() {
  const { user, settings, wallets, categories, updateUser, updateSettings, logout, addWallet, deleteWallet, addCategory, deleteCategory, hasHydrated } = useStore();
  const [newWallet, setNewWallet] = useState("");
  const [newWalletIcon, setNewWalletIcon] = useState("💳");
  
  const [newCat, setNewCat] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [newCatType, setNewCatType] = useState<'EXPENSE'|'INCOME'>('EXPENSE');

  const [newWalletBalance, setNewWalletBalance] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  if (!hasHydrated || !user) return null;

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
  };

  const handleDisplayToggle = (view: 'BS' | 'AD') => {
    updateSettings({ dateDisplay: view });
    toast.success(`Date: ${view}`);
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallet) return;
    addWallet({ 
      name: newWallet, 
      icon: newWalletIcon, 
      balance: Number(newWalletBalance) || 0 
    });
    setNewWallet("");
    setNewWalletBalance("");
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
    <div className="p-3 sm:p-6 space-y-6 max-w-lg mx-auto pb-32 animate-fade-in custom-scrollbar">
      {/* Profile Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-black">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-base font-black text-slate-800">{user.name}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium User</p>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-500 rounded-xl transition-all active:scale-95">
          <LogOut size={18} />
        </button>
      </div>

      {/* Settings Summary */}
      <div className="bg-slate-50 p-1 rounded-2xl flex items-center">
        <button
          onClick={() => handleDisplayToggle('BS')}
          className={cn("flex-1 py-2 text-[10px] font-black rounded-xl transition-all", settings.dateDisplay === 'BS' ? "bg-white shadow-sm text-primary" : "text-slate-400")}
        >NEPALI (BS)
        </button>
        <button
          onClick={() => handleDisplayToggle('AD')}
          className={cn("flex-1 py-2 text-[10px] font-black rounded-xl transition-all", settings.dateDisplay === 'AD' ? "bg-white shadow-sm text-primary" : "text-slate-400")}
        >ENGLISH (AD)
        </button>
      </div>

      {/* Wallets Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Wallet size={14} /> My Wallets</h2>
          <button 
            onClick={() => setIsManageMode(!isManageMode)}
            className={cn(
              "text-[10px] font-bold px-3 py-1 rounded-full transition-all",
              isManageMode ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
            )}
          >
            {isManageMode ? 'DONE' : 'MANAGE'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {wallets.map(w => (
            <div key={w.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{w.icon}</span>
                {isManageMode && wallets.length > 1 && (
                  <button 
                    onClick={() => setWalletToDelete(w.id)} 
                    className="w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-scale-in"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 truncate">{w.name}</p>
              <p className="text-sm font-black text-slate-800">Rs {w.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddWallet} className="bg-slate-50 p-2 rounded-2xl border border-dashed border-slate-200">
          <p className="text-[9px] font-bold text-slate-400 uppercase px-1 mb-2">Add New Wallet</p>
          <div className="flex gap-1.5 mb-1.5">
            <input type="text" value={newWalletIcon} onChange={e => setNewWalletIcon(e.target.value)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl text-center outline-none text-lg shadow-sm" maxLength={2} />
            <input type="text" value={newWallet} onChange={e => setNewWallet(e.target.value)} placeholder="Name (e.g. eSewa)" className="flex-1 bg-white border border-slate-100 rounded-xl px-3 outline-none text-xs font-bold shadow-sm" />
          </div>
          <div className="flex gap-1.5">
            <input type="number" value={newWalletBalance} onChange={e => setNewWalletBalance(e.target.value)} placeholder="Initial Balance" className="flex-1 bg-white border border-slate-100 rounded-xl px-3 py-2 outline-none text-xs font-bold shadow-sm" />
            <button type="submit" disabled={!newWallet} className="bg-primary text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md disabled:opacity-30">Add</button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={!!walletToDelete}
        onClose={() => setWalletToDelete(null)}
        onConfirm={() => walletToDelete && deleteWallet(walletToDelete)}
        title="Delete Wallet?"
        message="Are you sure you want to delete this wallet? This action cannot be undone."
      />
    </div>
  );
}
