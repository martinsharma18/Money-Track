"use client";

import { useStore } from "@/store/useStore";
import { User, LogOut, Settings, Wallet, Tag, X, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProfilePage() {
  const { user, settings, wallets, categories, updateUser, updateSettings, logout, addWallet, updateWallet, deleteWallet, addCategory, deleteCategory, hasHydrated } = useStore();
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
              {isManageMode ? (
                <div className="mt-1 relative animate-fade-in">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Rs</span>
                  <input 
                    type="number" 
                    defaultValue={w.balance}
                    onBlur={(e) => updateWallet(w.id, { balance: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-xs font-black text-slate-800 outline-none focus:border-primary transition-all"
                  />
                </div>
              ) : (
                <p className="text-sm font-black text-slate-800">Rs {w.balance.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddWallet} className="bg-slate-50 p-3 rounded-[2rem] border-2 border-dashed border-slate-200">
          <p className="text-[9px] font-black text-slate-400 uppercase px-1 mb-3 tracking-widest">Create New Wallet</p>
          
          {/* Icon Quick Picker */}
          <div className="flex gap-2 mb-3 px-1 overflow-x-auto pb-1 custom-scrollbar">
            {['💵', '💳', '🏦', '📱', '💰', '🪙', '📦', '🎁'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setNewWalletIcon(emoji)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90 shadow-sm",
                  newWalletIcon === emoji ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-white hover:bg-slate-100"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <div className="relative group">
               <input 
                type="text" 
                value={newWalletIcon} 
                onChange={e => setNewWalletIcon(e.target.value)} 
                className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-center outline-none text-xl shadow-lg shadow-slate-200/50 focus:border-primary transition-all" 
                maxLength={2} 
              />
              <p className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-slate-300">ICON</p>
            </div>
            <input 
              type="text" 
              value={newWallet} 
              onChange={e => setNewWallet(e.target.value)} 
              placeholder="Wallet Name (e.g. eSewa)" 
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 outline-none text-xs font-bold shadow-lg shadow-slate-200/50 focus:border-primary transition-all" 
            />
          </div>

          <div className="flex gap-2">
            <input 
              type="number" 
              value={newWalletBalance} 
              onChange={e => setNewWalletBalance(e.target.value)} 
              placeholder="Starting Balance" 
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 outline-none text-xs font-bold shadow-lg shadow-slate-200/50 focus:border-primary transition-all" 
            />
            <button 
              type="submit" 
              disabled={!newWallet} 
              className="bg-primary text-white px-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-30 active:scale-95 transition-all"
            >
              CREATE
            </button>
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
