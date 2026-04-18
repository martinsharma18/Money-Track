"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { Wallet, Mail, Lock, User, ArrowRight, ShieldCheck, Camera } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

import { supabase } from "@/utils/supabase";

export default function RegisterPage() {
  const { user, login, hasHydrated } = useStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hasHydrated && user) {
      router.replace("/");
    }
  }, [user, hasHydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        login({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          avatar: "",
        });
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10 space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Get Started</h1>
          <p className="text-xs font-bold text-slate-400">Join the elite finance community</p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-6 pt-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-100 transition-colors">
                <Camera size={20} className="text-slate-300 mb-1" />
                <span className="text-[8px] font-black text-slate-400 uppercase">Avatar</span>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-lg font-bold">+</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 8 characters"
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
                {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Security Feature */}
        <div className="flex items-center gap-3 px-4">
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 leading-tight">Your data is encrypted locally on your device for maximum privacy.</p>
        </div>
      </div>
    </div>
  );
}
