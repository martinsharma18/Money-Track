"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { Wallet, Mail, Lock, User, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

import { supabase } from "@/utils/supabase";

export default function LoginPage() {
  const { user, login, hasHydrated } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hasHydrated && user) {
      router.replace("/");
    }
  }, [user, hasHydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        login({
          id: data.user.id,
          name: data.user.user_metadata.name || email.split("@")[0].toUpperCase(),
          email: data.user.email!,
          avatar: data.user.user_metadata.avatar || "",
        });
        toast.success("Welcome back!");
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10 space-y-8 animate-fade-in">
        {/* Logo Section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 rotate-3">
            <Wallet className="text-white" size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Financial Hub</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Track every penny precisely</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 pt-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-6 px-1">Login to Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className={cn(
                  "w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50",
                )}
              >
                {isLoading ? "AUTHENTICATING..." : "SIGN IN"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400">
              New to Financial Hub?{" "}
              <Link href="/register" className="text-primary hover:underline underline-offset-4">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-slate-900 rounded-[2rem] p-4 flex items-center gap-4 text-white shadow-xl shadow-slate-900/20">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
             <TrendingUp className="text-green-400" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/50 uppercase leading-none mb-1">Total Impact</p>
            <p className="text-xs font-black">Joining 10,000+ Smart Savers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
