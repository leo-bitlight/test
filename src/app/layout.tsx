'use client'

import AccountProvider from "@/components/AccountProvider";
import Header from '../components/Header'

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
        </AccountProvider>
      </body>
    </html>
  );
}
