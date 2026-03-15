'use client';

/**
 * AuthForm — The right-side form panel for the Mighty Shortcut auth screen.
 * Handles both Sign In and Sign Up with smooth animated transitions.
 */

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import * as z from 'zod';
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createSupabaseUser, GetUsersPublic } from '@mighty/core/services/supabase.service';
import { MightyIcon } from '@/components/landing/MightyLogo';

// ── Schemas ────────────────────────────────────────────────────────────────
const signInSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address.' }),
  password: z.string().nonempty({ message: 'Password is required.' }),
});

const signUpSchema = signInSchema.extend({
  first_name: z.string().trim().min(1, { message: 'First name is required.' }),
  last_name: z.string().trim().min(1, { message: 'Last name is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type Mode = 'signin' | 'signup';

// ── Sub-components ─────────────────────────────────────────────────────────

function InputField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  disabled,
  rightSlot,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
}) {
  const hasError = Boolean(error);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-sans font-semibold text-xs uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full rounded-xl px-4 py-3.5 font-sans text-sm outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: hasError ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.9)',
            caretColor: '#FF7A1A',
            boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
          }}
          onFocus={(e) => {
            if (!hasError) {
              e.currentTarget.style.border = '1px solid rgba(255,122,26,0.5)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,122,26,0.1)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }
          }}
          onBlurCapture={(e) => {
            if (!hasError) {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }
          }}
        />
        {rightSlot && <div className="absolute top-1/2 right-3 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {hasError && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={12} style={{ color: 'rgba(239,68,68,0.8)', flexShrink: 0 }} />
          <p className="font-sans text-xs" style={{ color: 'rgba(239,68,68,0.8)' }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function AuthForm() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState(false);

  // Per-field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Animate panel swap
  const [panelVisible, setPanelVisible] = useState(true);
  const prevMode = useRef(mode);

  const switchMode = useCallback((next: Mode) => {
    setPanelVisible(false);
    setTimeout(() => {
      setMode(next);
      setError('');
      setNotice('');
      setFieldErrors({});
      setPanelVisible(true);
    }, 220);
  }, []);

  useEffect(() => {
    if (prevMode.current !== mode) prevMode.current = mode;
  }, [mode]);

  // ── Email blur — auto-detect signup ──────────────────────────────────────
  const checkEmail = useCallback(async () => {
    if (mode !== 'signin') return;
    const trimmed = email.trim();
    if (!z.string().email().safeParse(trimmed).success) return;
    const result = await GetUsersPublic(trimmed);
    if (!result.error && !result.user) {
      setNotice('No account found — switching to sign up.');
      switchMode('signup');
    }
  }, [mode, email, switchMode]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSignIn = useCallback(async () => {
    const parsed = signInSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      callbackUrl: '/',
      redirect: false,
    });
    setLoading(false);
    if (!result || result.error) {
      setError('Invalid email or password. Please try again.');
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/dashboard'), 600);
  }, [email, password, router]);

  const handleSignUp = useCallback(async () => {
    const parsed = signUpSchema.safeParse({
      first_name: firstName,
      last_name: lastName,
      email: email.trim(),
      password,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    setError('');
    const created = await createSupabaseUser(email.trim(), password, firstName.trim(), lastName.trim());
    setLoading(false);
    if (created.error) {
      setError(String(created.error));
      return;
    }
    setNotice('Account created! Sign in with your new credentials.');
    switchMode('signin');
  }, [firstName, lastName, email, password, switchMode]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    if (mode === 'signin') await handleSignIn();
    else await handleSignUp();
  };

  const submitLabel = useMemo(() => {
    if (loading) return null;
    if (success) return null;
    return mode === 'signin' ? 'Sign in' : 'Create account';
  }, [loading, mode, success]);

  // ── Password strength meter (sign-up only) ───────────────────────────────
  const pwdStrength = useMemo(() => {
    if (mode !== 'signup' || password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
  }, [mode, password]);

  const pwdStrengthColor =
    ['#AF1971', 'rgb(179 13 104)', '#eab308', '#22c55e'][Math.max(0, pwdStrength - 1)] ?? 'transparent';
  const pwdStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdStrength];

  return (
    <div
      className="flex h-full flex-col justify-center overflow-y-auto px-8 py-10 md:px-14 lg:px-16"
      style={{ background: '#0a0a0a' }}>
      <div className="mx-auto flex w-full max-w-[400px] flex-col gap-8">
        {/* Mobile-only logo */}
        <div className="flex lg:hidden">
          <MightyIcon size={32} />
        </div>

        {/* Header */}
        <div
          className="flex flex-col gap-2 transition-all duration-220"
          style={{ opacity: panelVisible ? 1 : 0, transform: panelVisible ? 'translateY(0)' : 'translateY(8px)' }}>
          <h1
            className="text-balance font-bold font-sans text-3xl"
            style={{ color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {mode === 'signin'
              ? 'Enter your credentials to access your workspace.'
              : 'Join 40,000+ power users. It only takes a moment.'}
          </p>
        </div>

        {/* Notice banner */}
        {notice && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,122,26,0.08)', border: '1px solid rgba(255,122,26,0.2)' }}>
            <CheckCircle2 size={14} style={{ color: '#FF7A1A', flexShrink: 0, marginTop: 1 }} />
            <p className="font-sans text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {notice}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
          style={{
            opacity: panelVisible ? 1 : 0,
            transform: panelVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}>
          {/* Sign-up extra fields */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="First name"
                id="first_name"
                placeholder="Ada"
                value={firstName}
                onChange={setFirstName}
                error={fieldErrors.first_name}
                autoComplete="given-name"
                disabled={loading}
              />
              <InputField
                label="Last name"
                id="last_name"
                placeholder="Lovelace"
                value={lastName}
                onChange={setLastName}
                error={fieldErrors.last_name}
                autoComplete="family-name"
                disabled={loading}
              />
            </div>
          )}

          <InputField
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            onBlur={checkEmail}
            error={fieldErrors.email}
            autoComplete="email"
            disabled={loading}
          />

          <InputField
            label="Password"
            id="password"
            type={showPwd ? 'text' : 'password'}
            placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            disabled={loading}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="flex items-center justify-center transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                aria-label={showPwd ? 'Hide password' : 'Show password'}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {/* Password strength — sign-up only */}
          {mode === 'signup' && password.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: n <= pwdStrength ? pwdStrengthColor : 'rgba(255,255,255,0.08)',
                    }}
                  />
                ))}
              </div>
              {pwdStrengthLabel && (
                <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: pwdStrengthColor }}>
                  {pwdStrengthLabel}
                </p>
              )}
            </div>
          )}

          {/* Sign-in: forgot password link */}
          {mode === 'signin' && (
            <div className="-mt-1 flex justify-end">
              <button
                type="button"
                className="font-sans text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FF7A1A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                Forgot password?
              </button>
            </div>
          )}

          {/* Global error */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={14} style={{ color: 'rgba(239,68,68,0.8)', flexShrink: 0, marginTop: 1 }} />
              <p className="font-sans text-xs leading-relaxed" style={{ color: 'rgba(239,68,68,0.8)' }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="relative mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-sans font-semibold text-sm transition-all duration-200 disabled:opacity-60"
            style={{
              background: success ? 'rgba(34,197,94,0.15)' : '#FF7A1A',
              border: success ? '1px solid rgba(34,197,94,0.4)' : '1px solid #FF7A1A',
              color: success ? 'rgb(74,222,128)' : '#0a0a0a',
              boxShadow: success ? '0 0 20px rgba(34,197,94,0.15)' : '0 0 0 rgba(255,122,26,0)',
            }}
            onMouseEnter={(e) => {
              if (!loading && !success) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(255,122,26,0.35)';
                (e.currentTarget as HTMLButtonElement).style.background = '#e66a0f';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !success) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 rgba(255,122,26,0)';
                (e.currentTarget as HTMLButtonElement).style.background = '#FF7A1A';
              }
            }}>
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : success ? (
              <>
                <CheckCircle2 size={17} />
                <span>Redirecting…</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
            or
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Mode toggle */}
        <p className="text-center font-sans text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            disabled={loading}
            className="font-semibold transition-colors"
            style={{ color: '#FF7A1A' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e66a0f')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#FF7A1A')}>
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        {/* Legal */}
        <p className="text-center font-sans text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
          By continuing you agree to our{' '}
          <a href="#" className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
