import type { Metadata } from 'next';
import React, { ReactNode, useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../../providers/session-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ToasterSonner } from '@mighty/ui/sonner';

import { auth } from '@mighty/core/auth';

// export const metadata: Metadata = {
//   title: 'Mighty Shortcut',
//   description: 'Mighty Shortcut to productivity',
// };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  console.log('RootLayout');
  return (
    <>
      <SessionProvider session={session}>
        <AuthProvider session={session}>
          <DashboardLayout>{children}</DashboardLayout>

          <ToasterSonner />
        </AuthProvider>
      </SessionProvider>
      <SpeedInsights />
    </>
  );
}
