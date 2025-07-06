import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using a default font
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CCTV Visionary',
  description: 'AI-Powered CCTV & IT System Planning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            >
            {children}
            <Toaster />
            </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
