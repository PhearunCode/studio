import type {Metadata} from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { getCustomers } from '@/lib/firebase';
import { type Customer } from '@/lib/types';

export const metadata: Metadata = {
  title: 'LendEasy PH',
  description: 'A comprehensive loan management system.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const customers: Customer[] = await getCustomers();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppLayout customers={customers}>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
