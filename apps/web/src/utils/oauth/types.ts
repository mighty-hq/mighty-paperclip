import { OAuth } from '@mighty/api';

export type OAuthType = 'oauth' | 'personal';

export type OnAuthorizeParams = {
  type: OAuthType;
  token: string;
  idToken?: string;
};

export interface OAuthServiceOptions {
  authorizeUrl: string;
  bodyEncoding?: 'json' | 'url-encoded';
  client: OAuth.PKCEClient;
  clientId: string;
  extraParameters?: Record<string, string>;
  onAuthorize?: (params: OnAuthorizeParams) => void;
  personalAccessToken?: string;
  refreshTokenUrl?: string;
  scope: string | string[];
  tokenRefreshResponseParser?: (response: unknown) => OAuth.TokenResponse;
  tokenResponseParser?: (response: unknown) => OAuth.TokenResponse;
  tokenUrl: string;
}

type BaseProviderOptions = {
  scope: string;
  personalAccessToken?: string;
  authorizeUrl?: string;
  tokenUrl?: string;
  refreshTokenUrl?: string;
  onAuthorize?: (params: OnAuthorizeParams) => void;
  bodyEncoding?: 'json' | 'url-encoded';
  tokenResponseParser?: (response: unknown) => OAuth.TokenResponse;
  tokenRefreshResponseParser?: (response: unknown) => OAuth.TokenResponse;
};

export type ProviderWithDefaultClientOptions = BaseProviderOptions & { clientId?: string };

export type ProviderOptions = BaseProviderOptions & { clientId: string };
