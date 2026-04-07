import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MessageSquare, Settings, LayoutDashboard, Mic } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AETHER AI",
  description: "Personal AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex h-full bg-[#f3f5f9] text-gray-900 font-sans p-2">
        <nav className="w-[84px] bg-[#11111a] rounded-[24px] flex flex-col items-center py-6 gap-8 z-50 flex-shrink-0 text-gray-400 mr-2 shadow-xl shadow-black/10">
          <div className="text-blue-500 mb-2 font-bold text-lg tracking-tighter cursor-pointer mt-2 leading-none">
            A<span className="text-white">AI</span>
          </div>
          <Link href="/assistant" className="group flex flex-col items-center gap-[6px] text-blue-400 transition-colors bg-white/5 w-[85%] rounded-2xl py-3 border border-white/5 shadow-inner">
            <MessageSquare className="w-[22px] h-[22px] fill-blue-500/20" />
            <span className="text-[9px] uppercase font-bold text-center opacity-100 tracking-widest">Chat</span>
          </Link>
          <div className="flex-1" />
          <Link href="/settings/integrations" className="group flex flex-col items-center gap-[6px] hover:text-blue-500 transition-colors mb-2 w-full">
            <Settings className="w-[22px] h-[22px]" />
            <span className="text-[9px] uppercase font-bold text-center opacity-70 group-hover:opacity-100 tracking-widest">Settings</span>
          </Link>
        </nav>
        <main className="flex-1 flex overflow-hidden rounded-[24px]">
          {children}
        </main>
      </body>
    </html>
  );
}
