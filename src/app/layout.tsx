'use client'

import AccountProvider from "@/components/AccountProvider";
import Header from '../components/Header';
import Toast from "@/components/Toast";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AccountProvider>
        <Header />
        {children}
        <Toast />
        </AccountProvider>
      </body>
    </html>
  );
}
