import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import FloatingChatWrapper from "@/components/chat/FloatingChatWrapper";
import BuyerBottomNav from "@/components/BuyerBottomNav";
import ProgressBarProvider from "@/components/ProgressBarProvider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LokaBeli — Belanja Mudah, Aman, dan Cepat",
  description: "Marketplace multi-vendor terpercaya di Indonesia. Jual beli produk berkualitas dengan pengiriman cepat dan pembayaran aman.",
  keywords: ["marketplace", "belanja online", "e-commerce", "toko online", "LokaBeli"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <ProgressBarProvider>
          {children}
          <Suspense fallback={null}>
            <FloatingChatWrapper />
          </Suspense>
          <BuyerBottomNav />
        </ProgressBarProvider>
      </body>
    </html>
  );
}
