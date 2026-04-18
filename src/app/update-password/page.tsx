"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

import { supabase } from "@/utils/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has an active session from the recovery link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired recovery link. Please try again.");
        router.replace("/forgot-password");
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      // Log them out so they log in with the new password, or redirect directly if you'd prefer
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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
          
          <h1 className="text-2xl font-black mb-2 tracking-tight">Create New Password</h1>
          <p className="text-sm text-slate-400 font-bold leading-relaxed mb-8">
            Please enter your new password below. Ensure it is at least 6 characters long.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-12 text-sm font-bold outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-12 text-sm font-bold outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
