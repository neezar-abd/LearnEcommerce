import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import FloatingChatWrapper from "@/components/chat/FloatingChatWrapper";

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
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingChatWrapper />
      </body>
    </html>
  );
}
