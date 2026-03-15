import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../providers/session-provider';
import { auth } from '@mighty/core/auth';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ToasterSonner } from '@mighty/ui/sonner';

import '../index.css';
import '../App.css';

export const metadata: Metadata = {
  title: 'Mighty Shortcut',
  description: 'Mighty Shortcut to productivity',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <AuthProvider session={session}>
            {children}
            <ToasterSonner />
          </AuthProvider>
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
