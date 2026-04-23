"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

import { supabase, getURL } from "@/utils/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}update-password`,
      });

      if (error) throw error;

      setIsSent(true);
      toast.success("Password reset link sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-100/50">
          <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6">
            <Wallet size={28} />
          </div>
          
          <h1 className="text-2xl font-black mb-2 tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-400 font-bold leading-relaxed mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50",
                  )}
                >
                  {isLoading ? "SENDING..." : "SEND RESET LINK"}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto text-primary">
                <Mail size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </p>
              <button 
                onClick={() => setIsSent(false)}
                className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
