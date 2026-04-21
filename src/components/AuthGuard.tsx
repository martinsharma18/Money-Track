"use client";

import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hasHydrated, fetchInitialData } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" || 
    pathname === "/update-password";

  useEffect(() => {
    if (hasHydrated && !user && !isAuthPage) {
      router.replace("/login");
    }
  }, [user, hasHydrated, isAuthPage, router]);

  useEffect(() => {
    if (hasHydrated && user) {
      fetchInitialData();
    }
  }, [user, hasHydrated, fetchInitialData]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Session</p>
        </div>
      </div>
    );
  }

  // If on Login/Register and user exists, RootLayout will handle the visual but this prevents flashing
  if (user && isAuthPage) return null;

  // Render children if authenticated or on an auth page
  if (user || isAuthPage) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return null;
}
