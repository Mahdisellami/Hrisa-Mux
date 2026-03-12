import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { Providers } from '@/lib/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hrisa-Mux - Music Streaming',
  description: 'Stream music from YouTube, SoundCloud, and your local library',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className: '',
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#f9fafb',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f9fafb',
                  },
                },
              }}
            />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
