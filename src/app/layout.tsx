'use client'

import { Geist, Geist_Mono } from "next/font/google";
import AccountProvider from "@/components/AccountProvider";
import Header from '../components/Header'

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AccountProvider>
        <Header />
        {children}
        </AccountProvider>
      </body>
    </html>
  );
}
