import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import AddTransactionSheet from "@/components/AddTransactionSheet";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Money Track",
  description: "Mobile-first personal finance tracking web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased bg-background text-foreground pb-[80px] md:pb-0 min-h-screen`}
      >
        <AuthGuard>
          <div className="md:flex h-screen md:overflow-hidden">
            {/* Desktop Sidebar could go here */}
            
            <main className="flex-1 md:overflow-y-auto w-full max-w-lg mx-auto md:max-w-none md:p-6 pb-24 md:pb-6 relative">
              {children}
            </main>
          </div>
          
          <BottomNav />
          <AddTransactionSheet />
        </AuthGuard>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
