"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import AddTransactionSheet from "@/components/AddTransactionSheet";
import GlobalHeader from "@/components/GlobalHeader";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { settings } = useStore();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/update-password";

  return (
    <html lang="en" suppressHydrationWarning className={settings.theme === 'dark' ? 'dark' : ''}>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased bg-background text-foreground pb-[80px] md:pb-0 min-h-screen`}
      >
        <AuthGuard>
          <div className="md:flex h-screen md:overflow-hidden relative">
            <main className="flex-1 md:overflow-y-auto w-full max-w-lg mx-auto md:max-w-none pb-24 md:pb-6 relative custom-scrollbar">
              {!isAuthPage && <GlobalHeader />}
              {children}
            </main>
          </div>
          
          {!isAuthPage && <BottomNav />}
          {!isAuthPage && <AddTransactionSheet />}
        </AuthGuard>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
