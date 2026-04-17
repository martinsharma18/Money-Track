"use client";

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export default function AddTransactionSheet() {
  const { categories, wallets, addTransaction, updateTransaction, transactions, isAddSheetOpen: isOpen, closeAddSheet: onClose, editingTransactionId } = useStore();
  
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Set defaults when opened
  useEffect(() => {
    if (isOpen) {
      if (editingTransactionId) {
        const tx = transactions.find(t => t.id === editingTransactionId);
        if (tx) {
          setType(tx.type);
          setAmount(tx.amount.toString());
          setCategoryId(tx.categoryId);
          setWalletId(tx.walletId);
          setNote(tx.note || '');
          setDate(tx.date.split('T')[0]);
          return;
        }
      }
      
      setType('EXPENSE');
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      
      const defaultExpenseCat = categories.find(c => c.type === 'EXPENSE');
      if (defaultExpenseCat) setCategoryId(defaultExpenseCat.id);
      
      if (wallets.length > 0) setWalletId(wallets[0].id);
    }
  }, [isOpen, editingTransactionId, categories, wallets, transactions]);

  // Update default category when type changes
  useEffect(() => {
    const defaultCat = categories.find(c => c.type === type);
    if (defaultCat) setCategoryId(defaultCat.id);
  }, [type, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!walletId) {
      toast.error('Please select a wallet');
      return;
    }

    const txData = {
      type,
      amount: Number(amount),
      categoryId,
      walletId,
      note,
      date: new Date(date).toISOString(),
    };

    if (editingTransactionId) {
      updateTransaction(editingTransactionId, txData);
      toast.success('Transaction updated');
    } else {
      addTransaction(txData);
      toast.success('Transaction added');
    }
    
    onClose();
  };

  const currentCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-card w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold">{editingTransactionId ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
            <button
              onClick={() => setType('EXPENSE')}
              className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", type === 'EXPENSE' ? "bg-white dark:bg-slate-700 shadow-sm text-expense" : "text-slate-500")}
            >
              Expense
            </button>
            <button
              onClick={() => setType('INCOME')}
              className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", type === 'INCOME' ? "bg-white dark:bg-slate-700 shadow-sm text-income" : "text-slate-500")}
            >
              Income
            </button>
          </div>

          <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Rs</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setAmount(val);
                    }
                  }}
                  className={cn("w-full bg-slate-50 dark:bg-slate-800/50 text-3xl font-bold rounded-2xl py-4 pl-14 pr-4 border-2 outline-none transition-colors", type === 'EXPENSE' ? "focus:border-expense" : "focus:border-income", "border-transparent")}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Grid */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {currentCategories.map(cat => (
                  <div 
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all",
                      categoryId === cat.id 
                        ? (type === 'EXPENSE' ? "border-expense bg-orange-50 dark:bg-orange-950/20" : "border-income bg-green-50 dark:bg-green-950/20")
                        : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100"
                    )}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-center truncate w-full">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Wallet</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {wallets.map(wallet => (
                  <div 
                    key={wallet.id}
                    onClick={() => setWalletId(wallet.id)}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap px-4 py-3 rounded-xl cursor-pointer border-2 transition-all shrink-0",
                      walletId === wallet.id 
                        ? "border-primary bg-blue-50 dark:bg-blue-950/20 text-primary"
                        : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    <span>{wallet.icon}</span>
                    <span className="text-sm font-medium">{wallet.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border-2 border-transparent focus:border-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border-2 border-transparent focus:border-primary outline-none"
                />
              </div>
            </div>
            
            <div className="h-10"></div> {/* padding */}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-card">
          <button
            type="submit"
            form="add-tx-form"
            className={cn(
              "w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95",
              type === 'EXPENSE' ? "bg-expense" : "bg-income"
            )}
          >
            <Check size={24} />
            Save {editingTransactionId ? 'Changes' : (type === 'EXPENSE' ? 'Expense' : 'Income')}
          </button>
          <div className="h-safe"></div>
        </div>
      </div>
    </div>
  );
}
