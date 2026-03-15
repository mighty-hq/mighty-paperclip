// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Command } from 'lucide-react';
// import { auth, signIn, } from '@mighty/core/auth';

// const AuthPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const onSignIn = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setLoading(true);
//     setMessage(null);
//     const { error } = await signIn(email, password);
//     setLoading(false);
//     if (error) {
//       setMessage(error);
//       return;
//     }
//     navigate('/dashboard');
//   };

//   const onSignUp = async () => {
//     setLoading(true);
//     setMessage(null);
//     const { error } = await signUp(email, password);
//     setLoading(false);
//     if (error) {
//       setMessage(error);
//       return;
//     }
//     setMessage('Account created. Confirm your email if required, then sign in.');
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] p-6">
//       <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-6">
//         <div className="mb-3 flex items-center gap-2">
//           <Command className="h-6 w-6 text-blue-400" />
//           <h1 className="font-semibold text-2xl text-[var(--text-primary)]">Sign in to Mighty Shortcut</h1>
//         </div>
//         <p className="mb-6 text-[var(--text-secondary)] text-sm">
//           Use the same account in browser and Electron to sync snippets, prompts, quick links, and launcher commands.
//         </p>
//         {!isConfigured && (
//           <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-400 text-xs">
//             Missing Supabase env vars. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
//           </div>
//         )}
//         <form onSubmit={onSignIn} className="space-y-3">
//           <input
//             type="email"
//             required
//             placeholder="you@example.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
//           />
//           <input
//             type="password"
//             required
//             minLength={6}
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
//           />
//           <button
//             type="submit"
//             disabled={loading || !isConfigured}
//             className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
//             {loading ? 'Please wait...' : 'Sign In'}
//           </button>
//         </form>
//         <button
//           type="button"
//           onClick={onSignUp}
//           disabled={loading || !isConfigured}
//           className="mt-3 w-full rounded-lg bg-white/10 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-white/15 disabled:opacity-50">
//           Create Account
//         </button>
//         {message && <p className="mt-3 text-[var(--text-secondary)] text-xs">{message}</p>}
//       </div>
//     </div>
//   );
// };

// export default AuthPage;
