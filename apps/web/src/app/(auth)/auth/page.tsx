'use client';
import React, { useEffect } from 'react';
import { AuthPanel } from './_components/authPanel';
import { AuthForm } from './_components/authForm';
import { clearStorage } from '@mighty/utils';

/**
 * Auth page — full-screen split-panel layout.
 * Left: animated brand / social-proof panel.
 * Right: sign-in / sign-up form.
 */
export default function AuthPage() {
  useEffect(() => {
    clearStorage();
  }, []);
  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Left brand panel — hidden on mobile, visible from lg */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[52%]">
        <AuthPanel />
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 xl:w-[48%]">
        <AuthForm />
      </div>
    </div>
  );
}
