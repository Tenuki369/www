import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Unified Services Platform',
  description: 'Tenant-aware operating system for financial, advisory, infrastructure, and logistics services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
