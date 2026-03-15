import type { NextAuthConfig, User, Session, Awaitable } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { handleError } from '../utils';
import type { JWT } from 'next-auth/jwt';

import { cookies } from 'next/headers';

import { signInWithSupabase, signOutFromSupabase } from '../services/supabase.service';

const combineUserData = (loggedInUser: any, supabaseSession: any): any => {
  //console.log('combineUserData user:', loggedInUser)
  //console.log('combineUserData supabaseSession:', supabaseSession)
  return {
    ...loggedInUser,
    id: loggedInUser.id,
    alias: loggedInUser.alias || '',
    first_name: loggedInUser.first_name ?? '',
    last_name: loggedInUser.last_name ?? '',
    name: `${loggedInUser.first_name} ${loggedInUser.last_name}`,
    email: loggedInUser.email ?? '',
    avatar: loggedInUser.avatar || '',
    company_id: loggedInUser.company_id || '',
    supabase_user_id: supabaseSession.user.id || '',
    supabaseSession: supabaseSession.session,
  };
};

// added to exports
export const options: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      authorize: async function (credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };
          console.log('loggedInUservvvvvvvvvvvvvvv start:');

          // Authenticate with Directus
          //const auth = await login({ email, password })

          const supabaseAuth = await signInWithSupabase(email, password);
          console.log('supabaseAuth', supabaseAuth);

          if (!supabaseAuth.success) {
            console.warn('Supabase authentication failed:', supabaseAuth.error);
            // Continue with Directus auth even if Supabase fails
            // You can change this behavior based on your requirements
          } else {
            //    console.log("Supabase authentication successful")
          }
          const loggedInUser: any = supabaseAuth.data?.user;
          const combinedUserData = combineUserData(loggedInUser, supabaseAuth.data);
          if (!loggedInUser) {
            return null;
          }
          const user: Awaitable<User> = {
            ...combinedUserData,
            id: loggedInUser.id,
            first_name: loggedInUser.first_name ?? '',
            last_name: loggedInUser.last_name ?? '',
            email: loggedInUser.email ?? '',
          };
          //    console.log("Login successful - Directus and Supabase authenticated");

          return user;
        } catch (error: any) {
          console.log('error', error);
          handleError(error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user, trigger, session }): Promise<JWT> {
      //  console.log('jwt session:', session)
      //  console.log('jwt user:', user)
      // console.log('jwt trigger sss:', trigger)

      if (trigger === 'update' && !session?.tokenIsRefreshed) {
        console.log('jwt trigger update session:', session);
        token.access_token = session.access_token;
        token.refresh_token = session.refresh_token;
        token.expires_at = session.expires_at;
        token.tokenIsRefreshed = false;
        token.supabaseSession = session.supabaseSession;
        token.user = session.user;
        token.userData = session.userData;
      }

      if (account) {
        console.log('jwt account:', account);
        const tokenWithUserData = {
          access_token: user.access_token,
          expires_at: user.expires,
          refresh_token: user.refresh_token,
          refresh_tokenxxx: 'xxxx',
          user: combineUserData(user, user.supabaseSession),
          // userData: user.userData,
          // supabaseSession: user.supabaseSession,
          error: null,
        };
        return tokenWithUserData;
      } else if (Date.now() < ((token.expires_at as number) ?? 0)) {
        return { ...token, error: null };
      } else {
        try {
          return token;
        } catch (error) {
          console.log('error jwt', error);
          return { ...token, error: 'RefreshAccessTokenError' as const };
        }
      }
    },
    async session({ session, token }): Promise<Session> {
      if (token.error) {
        console.log('session token error', token.error);
        session.error = token.error as string;
        session.expires = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() as Date & string;
      } else {
        //   const { id, name, email, supabaseSession } = token.user as UserParams
        //    console.log('session sessionxx:', session)
        //    console.log('token tokenxx:', token)
        //    console.log('token token.user:', token.user)

        session.user = token.user;
        session.access_token = token.access_token;
        session.tokenIsRefreshed = token?.tokenIsRefreshed ?? false;
        session.expires_at = token.expires_at;
        session.refresh_token = token.refresh_token;
        // session.userData = token.userData
        // session.supabaseSession = token.supabaseSession
      }
      //    console.log('return session session:', session)

      return session;
    },
  },
  events: {
    async signOut() {
      console.log('LOGGINGOUT core options START');

      try {
        // Sign out from Supabase
        //await directusMain.logout({ mode: 'session' });
        const { cookies: cookieImport } = await import('next/headers');
        const cookieStore = await cookieImport();

        await signOutFromSupabase();

        // Clear Supabase cookies

        // Clear all Supabase-specific cookies
        const allCookies = cookieStore.getAll();
        allCookies.forEach((cookie) => {
          if (cookie.name.startsWith('sb-')) {
            cookieStore.delete(cookie.name);
          }
          if (cookie.name.includes('directus')) {
            cookieStore.delete(cookie.name);
          }
        });
      } catch (error) {
        console.error('Error Logging out:', error);
      }
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
};
