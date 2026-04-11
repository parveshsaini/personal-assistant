import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MessageSquare, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
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
  title: "PSPA",
  description: "Parvesh Saini Personal Assistant",
  icons: { icon: "/ps-logo.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? "";
  const isAuthenticated = token ? verifyToken(token) : false;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={`flex h-full bg-[#f3f5f9] text-gray-900 font-sans ${isAuthenticated ? "p-2" : ""}`}>
        {isAuthenticated && (
          <nav className="w-[84px] bg-[#11111a] rounded-[24px] flex flex-col items-center py-6 gap-8 z-50 flex-shrink-0 text-gray-400 mr-2 shadow-xl shadow-black/10">
            <div className="mb-2 mt-2">
              <Image src="/ps-logo.png" alt="PSPA" width={44} height={44} className="rounded-xl" />
            </div>
            <Link href="/assistant" className="group flex flex-col items-center gap-[6px] text-blue-400 transition-colors bg-white/5 w-[85%] rounded-2xl py-3 border border-white/5 shadow-inner">
              <MessageSquare className="w-[22px] h-[22px] fill-blue-500/20" />
              <span className="text-[9px] uppercase font-bold text-center opacity-100 tracking-widest">Chat</span>
            </Link>
            <div className="flex-1" />
            <Link href="/settings/integrations" className="group flex flex-col items-center gap-[6px] hover:text-blue-500 transition-colors w-full">
              <Settings className="w-[22px] h-[22px]" />
              <span className="text-[9px] uppercase font-bold text-center opacity-70 group-hover:opacity-100 tracking-widest">Settings</span>
            </Link>
            <LogoutButton />
          </nav>
        )}
        <main className={isAuthenticated ? "flex-1 flex overflow-hidden rounded-[24px]" : "flex-1 flex"}>
          {children}
        </main>
      </body>
    </html>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="group flex flex-col items-center gap-[6px] hover:text-red-400 transition-colors w-full mb-2"
        title="Sign out"
      >
        <LogOut className="w-[22px] h-[22px]" />
        <span className="text-[9px] uppercase font-bold text-center opacity-70 group-hover:opacity-100 tracking-widest">Logout</span>
      </button>
    </form>
  );
}
