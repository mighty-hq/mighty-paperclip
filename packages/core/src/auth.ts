import type { User, Session, DefaultSession } from 'next-auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
export const isDev = process.env.NODE_ENV === 'development';

import type { JWT } from 'next-auth/jwt';

import { handleError } from './utils';
import { signInWithSupabase, signOutFromSupabase } from './services/supabase.service';
// added to exports

declare module 'next-auth' {
  interface User {
    access_token: string;
    directusAuth?: AuthRefresh;
    email: string;
    expires: number;
    first_name: string;
    id: string;
    last_name: string;
    refresh_token: string;
    supabaseSession?: any;
    user?: any;
    user_type?: string;
    userData?: any; // Full user data for MobX store
  }

  interface Session {
    access_token?: string;
    directusAuth?: AuthRefresh;
    error?: string | null;
    expires_at?: number;
    refresh_token?: string;
    supabaseSession?: any;
    tokenIsRefreshed: boolean | null;
    user: DefaultSession['user'] & {
      id?: string;
      company_id?: string;
      role?: string;

      [key: string]: any;
    };
    userData?: any; // Full user data for MobX store
  }
}
type Awaitable<T> = T | PromiseLike<T>;

declare module 'next-auth/jwt' {
  interface JWT extends JWTType {}
}

export type JWTType = {
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
  error?: string | null;
  tokenIsRefreshed?: boolean | null;
  directusAuth?: AuthRefresh;
  userData?: any; // Full user data for MobX store
  supabaseSession?: any;
  user?: any;
};
export type AuthRefresh = {
  access_token?: string | null;
  expires?: number | null;
  refresh_token?: string | null;
  expires_at?: number | null;
};

export type UserSession = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  access_token?: string;
  expires?: number;
  refresh_token?: string;
  avatar?: string;
  company_id?: string;
  supabase_user_id?: string;
  supabaseSession?: any;
  userData?: any;
  user?: any;
  directusAuth?: AuthRefresh;
};

export type UserParams = {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company_id?: string;
  supabase_user_id?: string;
  supabaseSession?: any;
  userData?: any;
  directusAuth?: AuthRefresh;
};

/* eslint-disable typescript-sort-keys/interface */
export interface ClientSecretPayload {
  /**
   * Represents the user's API key
   *
   * If provider need multi keys like bedrock,
   * this will be used as the checker whether to use frontend key
   */
  apiKey?: string;
  /**
   * ComfyUI specific authentication fields
   */
  authType?: string;

  awsAccessKeyId?: string;

  awsRegion?: string;

  awsSecretAccessKey?: string;
  awsSessionToken?: string;
  azureApiVersion?: string;
  /**
   * Represents the endpoint of provider
   */
  baseURL?: string;

  bearerToken?: string;

  bearerTokenExpiresAt?: number;

  cloudflareBaseURLOrAccountID?: string;
  customHeaders?: Record<string, string>;
  /**
   * GitHub Copilot OAuth fields
   */
  oauthAccessToken?: string;
  password?: string;

  runtimeProvider?: string;
  /**
   * user id
   * in client db mode it's a uuid
   * in server db mode it's a user id
   */
  userId?: string;
  username?: string;

  vertexAIRegion?: string;
}

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
    supabase_user_id: supabaseSession?.user?.id || '',
    supabaseSession,
  };
};
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
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

          const supabaseAuth: any = await signInWithSupabase(email, password);
          if (isDev) {
            console.log('signIn supabase', supabaseAuth);
          }
          if (!supabaseAuth.success || !supabaseAuth.data?.user) {
            console.warn('Supabase authentication failed:', supabaseAuth.error);
            return null;
          }

          const combinedUserData = {
            ...supabaseAuth.data?.user,
            id: supabaseAuth.data?.user?.id,
            first_name: supabaseAuth.data?.user?.first_name ?? '',
            last_name: supabaseAuth.data?.user?.last_name ?? '',
            email: supabaseAuth.data?.user?.email ?? '',
            access_token: supabaseAuth.data?.session?.access_token ?? '',
            refresh_token: supabaseAuth.data?.session?.refresh_token ?? '',
            expires: supabaseAuth.data?.session?.expires_at ?? 0,
            supabaseSession: supabaseAuth.data?.session ?? null,
          };
          const user: Awaitable<User> = {
            ...combinedUserData,
            id: supabaseAuth.data?.user?.id,
            first_name: supabaseAuth.data?.user?.first_name ?? '',
            last_name: supabaseAuth.data?.user?.last_name ?? '',
            email: supabaseAuth.data?.user?.email ?? '',
          };
          return user;
        } catch (error: any) {
          console.log('error', error);
          handleError(error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user, trigger, session }): Promise<JWT> {
      try {
        return token;
      } catch (error) {
        console.log('error jwt', error);
        return { ...token, error: 'RefreshAccessTokenError' as const };
      }
    },
    async session({ session, token }): Promise<Session> {
      if (token.error) {
        console.log('session token error', token.error);
        session.error = token.error;
        session.expires_at = Math.floor(Date.now() + 1000 * 60 * 60 * 24 * 30);

        // session.expires = Math.floor(Date.now() + (1000 * 60 * 60 * 24 * 30))
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
      console.log('LOGGINGOUT CORE START');

      try {
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
        });
      } catch (error) {
        console.error('Error Logging out:', error);
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
});
