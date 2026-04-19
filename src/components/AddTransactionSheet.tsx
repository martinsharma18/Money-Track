"use client";

import { useState, useEffect, useMemo } from 'react';
import { X, Check, Trash2, GripVertical } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategoryItem({ 
  cat, 
  categoryId, 
  isManageMode, 
  type, 
  setCategoryId, 
  setCategoryToDelete 
}: { 
  cat: any, 
  categoryId: string, 
  isManageMode: boolean, 
  type: string,
  setCategoryId: (id: string) => void,
  setCategoryToDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cat.id, disabled: !isManageMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      onClick={() => !isManageMode && setCategoryId(cat.id)}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 transition-all relative",
        categoryId === cat.id 
          ? (type === 'EXPENSE' ? "border-expense bg-orange-50" : "border-income bg-green-50")
          : "border-transparent bg-slate-50 hover:bg-slate-100",
        isManageMode ? "ring-2 ring-red-100 cursor-grab active:cursor-grabbing" : "",
        isDragging ? "opacity-50 scale-105 shadow-lg border-primary" : ""
      )}
      {...(isManageMode ? { ...attributes, ...listeners } : {})}
    >
      {/* Delete button (All categories) */}
      {isManageMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCategoryToDelete(cat.id);
          }}
          className="absolute -top-1 -right-1 bg-white border border-slate-200 text-red-500 p-1 rounded-full shadow-sm animate-scale-in flex items-center justify-center z-20"
        >
          <Trash2 size={10} />
        </button>
      )}

      {/* Drag Indicator Overlay */}
      {isManageMode && (
        <div className="absolute top-1 left-1 text-slate-300">
           <GripVertical size={10} />
        </div>
      )}

      <span className="text-xl mb-0.5">{cat.icon}</span>
      <span className="text-[9px] font-bold text-center truncate w-full">{cat.name}</span>
    </div>
  );
}

export default function AddTransactionSheet() {
  const { categories, wallets, addTransaction, updateTransaction, deleteTransaction, deleteCategory, reorderCategories, transactions, isAddSheetOpen: isOpen, closeAddSheet: onClose, editingTransactionId } = useStore();
  
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentCategories = useMemo(() => {
    return categories
      .filter(c => c.type === type)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories, type]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentCategories.findIndex((c) => c.id === active.id);
      const newIndex = currentCategories.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(currentCategories, oldIndex, newIndex);
      reorderCategories(type, newOrder);
    }
  };

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

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('💰');

  const { addCategory } = useStore();

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      toast.error('Enter category name');
      return;
    }
    addCategory({
      name: newCatName,
      icon: newCatIcon,
      type: type,
    });
    setNewCatName('');
    setIsAddingCategory(false);
    toast.success('Category added');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (!categoryId) {
      toast.error('Select category');
      return;
    }
    if (!walletId) {
      toast.error('Select wallet');
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
      toast.success('Updated');
    } else {
      addTransaction(txData);
      toast.success('Added');
    }
    
    onClose();
  };

  const commonIcons = [
    // Nepali daily use
    '\u{1F3E0}', '\u{1F95B}', '\u{1F375}', '\u{1F68C}', '\u{1F373}', '\u{1F966}', '\u{1F457}', '\u{1F3AC}', '\u{1F3E6}', '\u{1F4F1}',
    // Food & drink
    '\u{1F354}', '\u{1F355}', '\u{1F371}', '\u{1F35A}', '\u{1F96B}', '\u{1F35C}', '\u{2615}', '\u{1F37C}', '\u{1F964}',
    // Shopping
    '\u{1F6D2}', '\u{1F455}', '\u{1F454}', '\u{1F45F}', '\u{1F454}', '\u{1F484}',
    // Transport
    '\u{1F697}', '\u{1F6B5}', '\u{1F6B2}', '\u26F5', '\u2708\uFE0F', '\u{1F682}',
    // Finance / Utilities
    '\u{1F4A1}', '\u{1F50C}', '\u{1F4BB}', '\u{1F4DA}', '\u{1F3A8}', '\u{1F4DD}', '\u{1F527}',
    // Health
    '\u{1F3E5}', '\u{1F489}', '\u{1F9B7}', '\u{1F48A}',
    // Fun
    '\u{1F3AE}', '\u{1F3A7}', '\u{1F4F8}', '\u{1F3A8}', '\u26BD', '\u{1F3B8}',
    // Misc
    '\u{1F381}', '\u{1F525}', '\u2744\uFE0F', '\u{1F436}', '\u{1F431}', '\u{1F331}',
  ];

  const quickSuggestCategories = [
    { name: 'Rent', icon: '\u{1F3E0}' }, { name: 'Milk', icon: '\u{1F95B}' }, { name: 'Tea', icon: '\u{1F375}' },
    { name: 'Bus', icon: '\u{1F68C}' }, { name: 'Kitchen', icon: '\u{1F373}' }, { name: 'Tarkari', icon: '\u{1F966}' },
    { name: 'Cloth', icon: '\u{1F457}' }, { name: 'Loan', icon: '\u{1F3E6}' }, { name: 'Entertainment', icon: '\u{1F3AC}' },
    { name: 'Food', icon: '\u{1F354}' }, { name: 'Health', icon: '\u{1F48A}' }, { name: 'Other', icon: '\u{1F4B8}' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-card w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[95vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <h2 className="text-base font-bold">{editingTransactionId ? 'Edit' : 'New Transaction'}</h2>
          <button onClick={onClose} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {/* Type Toggle - Slimmer */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-3">
            <button
              onClick={() => setType('EXPENSE')}
              className={cn("flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all", type === 'EXPENSE' ? "bg-white shadow-sm text-expense" : "text-slate-500")}
            >
              Expense
            </button>
            <button
              onClick={() => setType('INCOME')}
              className={cn("flex-1 py-1 text-[10px] font-black uppercase rounded-lg transition-all", type === 'INCOME' ? "bg-white shadow-sm text-income" : "text-slate-500")}
            >
              Income
            </button>
          </div>

          <form id="add-tx-form" onSubmit={handleSubmit} className="space-y-3">
            {/* Amount - Compact */}
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">Rs</span>
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
                  className={cn("w-full bg-slate-50 text-xl font-black rounded-xl py-2 pl-10 pr-4 border-2 outline-none transition-colors", type === 'EXPENSE' ? "focus:border-expense" : "focus:border-income", "border-transparent")}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            {/* Compact Category Horizontal Scroll */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                {currentCategories.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setIsManageMode(!isManageMode)}
                    className={cn(
                      "text-[8px] font-bold px-2 py-0.5 rounded-full transition-all",
                      isManageMode ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {isManageMode ? 'DONE' : 'EDIT'}
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                 <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={currentCategories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex gap-2 min-w-max">
                      {currentCategories.map((cat) => (
                        <div key={cat.id} className="min-w-[54px]">
                          <SortableCategoryItem 
                            cat={cat} 
                            type={type}
                            categoryId={categoryId}
                            isManageMode={isManageMode}
                            setCategoryId={setCategoryId}
                            setCategoryToDelete={setCategoryToDelete}
                          />
                        </div>
                      ))}
                      
                      {/* Add New Category Button */}
                      {!isAddingCategory && !isManageMode && (
                        <div 
                          onClick={() => setIsAddingCategory(true)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100 h-full w-[54px]"
                        >
                          <span className="text-lg text-slate-400">+</span>
                          <span className="text-[8px] font-bold text-slate-400">New</span>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {isAddingCategory && (
                <div className="bg-slate-50 p-2 rounded-xl border-2 border-primary/20 space-y-2 animate-fade-in relative z-20">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-primary uppercase">New Category</p>
                    <button type="button" onClick={() => setIsAddingCategory(false)}><X size={14} className="text-slate-400" /></button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Quick suggestions */}
                    <div className="flex gap-1.5 flex-wrap">
                      {quickSuggestCategories
                        .filter(s => !currentCategories.some(c => c.name.toLowerCase() === s.name.toLowerCase()))
                        .map(s => (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => { setNewCatIcon(s.icon); setNewCatName(s.name); }}
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold transition-all",
                              newCatName === s.name
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-slate-200 text-slate-600 hover:border-primary"
                            )}
                          >
                            <span>{s.icon}</span>
                            <span>{s.name}</span>
                          </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg border border-slate-200 shadow-sm shrink-0">
                        {newCatIcon}
                      </div>
                      <input 
                        type="text" 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Category Name" 
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-7 gap-1 max-h-24 overflow-y-auto p-1 bg-white rounded-lg border border-slate-100 custom-scrollbar">
                      {commonIcons.map(icon => (
                        <button 
                          key={icon} 
                          type="button" 
                          onClick={() => setNewCatIcon(icon)} 
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-md transition-all text-base",
                            newCatIcon === icon ? "bg-primary/20 scale-110 shadow-sm" : "hover:bg-slate-50"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddCategory}
                      className="w-full bg-primary text-white py-1.5 rounded-lg text-xs font-bold"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wallets - Compact */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Wallet</label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {wallets.map(wallet => (
                  <div 
                    key={wallet.id}
                    onClick={() => setWalletId(wallet.id)}
                    className={cn(
                      "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-lg cursor-pointer border-2 transition-all shrink-0",
                      walletId === wallet.id 
                        ? "border-primary bg-blue-50 text-primary"
                        : "border-transparent bg-slate-50 hover:bg-slate-100 text-slate-600"
                    )}
                  >
                    <span className="text-xs">{wallet.icon}</span>
                    <span className="text-[10px] font-bold">{wallet.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Note - Compact */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 rounded-lg px-2 py-1.5 text-xs border-2 border-transparent focus:border-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note..."
                  className="w-full bg-slate-50 rounded-lg px-2 py-1.5 text-xs border-2 border-transparent focus:border-primary outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed & Slim */}
        <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
          {editingTransactionId && (
            <button
              type="button"
              onClick={() => setTransactionToDelete(editingTransactionId)}
              className="px-4 py-3 rounded-xl bg-orange-100 text-orange-600 font-black shadow-sm active:scale-95 transition-all text-sm flex items-center justify-center"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            type="submit"
            form="add-tx-form"
            className={cn(
              "flex-1 py-3 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg",
              type === 'EXPENSE' ? "bg-expense shadow-orange-200" : "bg-income shadow-green-200"
            )}
          >
            <Check size={18} />
            SAVE
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(categoryToDelete);
            if (categoryId === categoryToDelete) setCategoryId('');
          }
        }}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Any transactions using this category will still exist but without a category name."
      />

      <ConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete) {
            deleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
            onClose();
          }
        }}
        title="Delete Transaction?"
        message="Are you sure you want to permanently delete this transaction? Your balance will be updated automatically."
      />
    </div>
  );
}
