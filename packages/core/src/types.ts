/* eslint-disable typescript-sort-keys/interface */
import type { Session, DefaultSession } from 'next-auth';
import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
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
  type Awaitable<T> = T | PromiseLike<T>;
}

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
// Type definitions for the Mighty clone application

export interface ClipboardItem {
  category: string | null;
  content: string;
  id: string;
  isFavorite: boolean;
  language?: string;
  timestamp: Date;
  type: 'text' | 'code' | 'link' | 'image';
}

export interface Category {
  color: string;
  icon: string;
  id: string;
  name: string;
}

export interface Snippet {
  categoryId: string;
  content: string;
  createdAt: Date;
  id: string;
  isFavorite: boolean;
  language?: string;
  tags: string[];
  title: string;
  type: 'text' | 'code' | 'link';
  usageCount: number;
}

export interface Command {
  action: string;
  category: string;
  icon: string;
  id: string;
  subtitle: string;
  title: string;
}

export interface PromptCategory {
  count: number;
  icon: string;
  id: string;
  name: string;
}

export interface Prompt {
  categoryId: string;
  icon: string;
  id: string;
  isFavorite: boolean;
  subtitle: string;
  title: string;
}
