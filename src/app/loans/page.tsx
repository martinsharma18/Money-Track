"use client";

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import GlobalHeader from '@/components/GlobalHeader';
import { Plus, ArrowUpRight, ArrowDownLeft, Calendar, User, MoreVertical, Trash2, CheckCircle2, Banknote } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { formatDisplayDate } from '@/utils/date';


export default function LoansPage() {
  const { loans, loanPayments, wallets, addLoan, addLoanPayment, deleteLoan, deleteLoanPayment } = useStore();
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Stats
  const totalLent = loans.filter(l => l.type === 'LENT').reduce((acc, l) => acc + l.remainingAmount, 0);
  const totalBorrowed = loans.filter(l => l.type === 'BORROWED').reduce((acc, l) => acc + l.remainingAmount, 0);

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const paidLoans = loans.filter(l => l.status === 'PAID');

  const handleDeleteLoan = async () => {
    if (deleteConfirmId) {
      await deleteLoan(deleteConfirmId);
      setDeleteConfirmId(null);
      toast.success("Loan deleted");
    }
  };

  return (
    <main className="pb-32 min-h-screen bg-slate-50 dark:bg-slate-950">
      

      
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <ArrowUpRight size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lent (सापटी दिएको)</span>
            </div>

            <div className="text-xl font-bold text-slate-900 dark:text-white">
              Rs. {totalLent.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                <ArrowDownLeft size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Borrowed (सापटी लिएको)</span>
            </div>

            <div className="text-xl font-bold text-slate-900 dark:text-white">
              Rs. {totalBorrowed.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setIsAddLoanOpen(true)}
          className="w-full py-4 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <Plus size={20} />
          New Loan / Debt
        </button>

        {/* Loans List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">Active</h2>
          {activeLoans.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">No active loans found</p>
            </div>
          ) : (
            activeLoans.map(loan => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
                onEdit={() => { setEditingLoanId(loan.id); setIsAddLoanOpen(true); }}
                onAddPayment={() => { setSelectedLoanId(loan.id); setIsPaymentOpen(true); }}
                onDelete={() => setDeleteConfirmId(loan.id)}
              />
            ))
          )}

          {paidLoans.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1 pt-4">Paid</h2>
              <div className="space-y-3 opacity-60">
                {paidLoans.map(loan => (
                  <LoanCard 
                    key={loan.id} 
                    loan={loan} 
                    onEdit={() => { setEditingLoanId(loan.id); setIsAddLoanOpen(true); }}
                    onDelete={() => setDeleteConfirmId(loan.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Loan Modal/Sheet */}
      {isAddLoanOpen && (
        <AddLoanSheet 
          onClose={() => { setIsAddLoanOpen(false); setEditingLoanId(null); }} 
          loanId={editingLoanId || undefined}
        />
      )}

      {/* Payment Modal/Sheet */}
      {isPaymentOpen && selectedLoanId && (
        <AddPaymentSheet 
          loanId={selectedLoanId} 
          onClose={() => { setIsPaymentOpen(false); setSelectedLoanId(null); }} 
        />
      )}

      <ConfirmModal 
        isOpen={!!deleteConfirmId}
        title="Delete Loan"
        message="Are you sure you want to delete this loan? This action cannot be undone."
        onConfirm={handleDeleteLoan}
        onClose={() => setDeleteConfirmId(null)}
      />

    </main>
  );
}

function LoanCard({ loan, onEdit, onAddPayment, onDelete }: { loan: any, onEdit: () => void, onAddPayment?: () => void, onDelete: () => void }) {
  const { settings } = useStore();
  const isLent = loan.type === 'LENT';
  const progress = ((loan.amount - loan.remainingAmount) / loan.amount) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isLent ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
          )}>
            <User size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{loan.personName}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={12} />
              {formatDisplayDate(loan.date, settings.dateDisplay)}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          {loan.status === 'ACTIVE' && onAddPayment && (
            <button 
              onClick={onAddPayment}
              className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Add Payment"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
          <button 
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Edit Loan"
          >
            <MoreVertical size={18} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Remaining</span>
            <div className={cn("text-lg font-bold", isLent ? "text-emerald-600" : "text-rose-600")}>
              Rs. {loan.remainingAmount.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total</span>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Rs. {loan.amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", isLent ? "bg-emerald-500" : "bg-rose-500")}
            style={{ width: `${progress}%` }}
          />
        </div>

        {loan.note && (
          <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
            {loan.note}
          </p>
        )}
      </div>
    </div>
  );
}

function AddLoanSheet({ onClose, loanId }: { onClose: () => void, loanId?: string }) {
  const { loans, wallets, addLoan, updateLoan } = useStore();
  const editingLoan = loanId ? loans.find(l => l.id === loanId) : null;

  const [formData, setFormData] = useState({
    personName: editingLoan?.personName || '',
    amount: editingLoan?.amount.toString() || '',
    type: editingLoan?.type || 'BORROWED' as 'LENT' | 'BORROWED',
    walletId: editingLoan?.walletId || wallets[0]?.id || '',
    note: editingLoan?.note || '',
    date: (editingLoan?.date || new Date().toISOString()).split('T')[0],
    dueDate: (editingLoan?.dueDate || '').split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName || !formData.amount || !formData.walletId) {
      toast.error("Please fill required fields");
      return;
    }

    if (editingLoan) {
      updateLoan(editingLoan.id, {
        personName: formData.personName,
        amount: parseFloat(formData.amount),
        remainingAmount: parseFloat(formData.amount) - (editingLoan.amount - editingLoan.remainingAmount), // Keep paid progress
        type: formData.type,
        walletId: formData.walletId,
        note: formData.note,
        date: new Date(formData.date).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
      toast.success("Loan updated");
    } else {
      addLoan({
        personName: formData.personName,
        amount: parseFloat(formData.amount),
        type: formData.type,
        walletId: formData.walletId,
        note: formData.note,
        date: new Date(formData.date).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
      toast.success("Loan added");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingLoan ? 'Edit Loan' : 'Add New Loan/Debt'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'BORROWED' })}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex flex-col items-center",
                formData.type === 'BORROWED' ? "bg-white dark:bg-slate-700 shadow-sm text-rose-600" : "text-slate-500"
              )}
            >
              <span>I Borrowed</span>
              <span className="text-[10px] opacity-70 italic">मैले लिएको</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'LENT' })}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex flex-col items-center",
                formData.type === 'LENT' ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600" : "text-slate-500"
              )}
            >
              <span>I Lent</span>
              <span className="text-[10px] opacity-70 italic">मैले दिएको</span>
            </button>

          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Person Name</label>
            <input 
              type="text" 
              placeholder="Who is it?"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none"
              value={formData.personName}
              onChange={e => setFormData({ ...formData, personName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Wallet</label>
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none appearance-none"
                value={formData.walletId}
                onChange={e => setFormData({ ...formData, walletId: e.target.value })}
                required
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Due Date (Opt)</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Note</label>
            <textarea 
              placeholder="Any details..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none resize-none h-20"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            Save Loan
          </button>
        </form>
      </div>
    </div>
  );
}

function AddPaymentSheet({ loanId, onClose }: { loanId: string, onClose: () => void }) {
  const { loans, wallets, addLoanPayment } = useStore();
  const loan = loans.find(l => l.id === loanId);
  const [formData, setFormData] = useState({
    amount: loan?.remainingAmount.toString() || '',
    walletId: wallets[0]?.id || '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  if (!loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.walletId) return;

    addLoanPayment({
      loanId,
      amount: parseFloat(formData.amount),
      walletId: formData.walletId,
      note: formData.note,
      date: new Date(formData.date).toISOString(),
    });

    toast.success("Payment recorded");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record Payment</h2>
            <p className="text-sm text-slate-500">For {loan.personName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Payment Amount</label>
            <input 
              type="number" 
              placeholder="0.00"
              max={loan.remainingAmount}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none text-2xl font-bold text-primary"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <p className="text-[10px] text-slate-500 mt-1 ml-1">Remaining balance: Rs. {loan.remainingAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Wallet</label>
            <select 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none appearance-none"
              value={formData.walletId}
              onChange={e => setFormData({ ...formData, walletId: e.target.value })}
              required
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
            <input 
              type="date" 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Note</label>
            <input 
              type="text" 
              placeholder="Optional note"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 ring-primary/20 transition-all outline-none"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            Confirm Payment
          </button>
        </form>
      </div>
    </div>
  );
}
