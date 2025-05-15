// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Ensure Tailwind CSS is imported
import Providers from './providers'; // Import the TanStack Query Providers

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TanStack Query Ticket System',
  description: 'A demo app showcasing TanStack Query with Next.js and Prisma',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 min-h-screen`}>
        <Providers> {/* Wrap your application with the QueryClientProvider */}
          <main className="container mx-auto p-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
