import type { ImageLike } from '../types/image';

/**
 * OAuth namespace for PKCE flow (browser-compatible typing/runtime shim).
 */
export namespace OAuth {
  export enum RedirectMethod {
    Web = 'web',
    App = 'app',
    AppURI = 'appURI',
  }

  export interface AuthorizationRequestOptions {
    clientId: string;
    endpoint: string;
    extraParameters?: Record<string, string>;
    scope: string;
  }

  export interface AuthorizationRequestURLParams {
    codeChallenge: string;
    codeVerifier: string;
    redirectURI: string;
    state: string;
  }

  export interface AuthorizationRequest extends AuthorizationRequestURLParams {
    toURL(): string;
  }

  export interface AuthorizationOptions {
    url: string;
  }

  export interface AuthorizationResponse {
    authorizationCode: string;
  }

  export interface TokenSet {
    accessToken: string;
    expiresIn?: number;
    idToken?: string;
    isExpired: () => boolean;
    refreshToken?: string;
    scope?: string;
    updatedAt: Date;
  }

  export interface TokenSetOptions {
    accessToken: string;
    expiresIn?: number;
    idToken?: string;
    refreshToken?: string;
    scope?: string;
  }

  export interface TokenResponse {
    access_token: string;

    // Compatibility aliases used by utility package code.
    accessToken?: string;
    expires_in?: number;
    id_token?: string;
    idToken?: string;
    isExpired?: () => boolean;
    refresh_token?: string;
    refreshToken?: string;
    scope?: string | string[];
  }

  export namespace PKCEClient {
    export interface Options {
      description?: string;
      providerIcon?: ImageLike;
      providerId?: string;
      providerName: string;
      redirectMethod: RedirectMethod;
    }
  }

  const randomPart = () => Math.random().toString(36).slice(2, 12);

  const normalizeTokenSet = (options: TokenSetOptions | TokenResponse): TokenSet => {
    const now = new Date();
    const hasSnakeCase = 'access_token' in options;
    const accessToken = hasSnakeCase ? options.access_token : options.accessToken;
    const refreshToken = hasSnakeCase ? options.refresh_token : options.refreshToken;
    const expiresIn = hasSnakeCase ? options.expires_in : options.expiresIn;
    const idToken = hasSnakeCase ? options.id_token : options.idToken;
    const scope = hasSnakeCase
      ? Array.isArray(options.scope)
        ? options.scope.join(' ')
        : options.scope
      : options.scope;
    const updatedAt = now;

    const isExpired = () => {
      if (!expiresIn) return false;
      const expiresAtMs = updatedAt.getTime() + expiresIn * 1000;
      return Date.now() > expiresAtMs - 5000;
    };

    return {
      accessToken,
      refreshToken,
      expiresIn,
      idToken,
      scope,
      updatedAt,
      isExpired,
    };
  };

  export class PKCEClient {
    redirectMethod: RedirectMethod;
    providerName: string;
    providerIcon?: ImageLike;
    providerId: string;
    description?: string;
    private tokenSet?: TokenSet;

    constructor(options: PKCEClient.Options) {
      this.redirectMethod = options.redirectMethod;
      this.providerName = options.providerName;
      this.providerIcon = options.providerIcon;
      this.providerId = options.providerId ?? options.providerName.toLowerCase().replace(/\s+/g, '-');
      this.description = options.description;
    }

    async authorizationRequest(options: AuthorizationRequestOptions): Promise<AuthorizationRequest> {
      const state = randomPart();
      const codeVerifier = randomPart() + randomPart();
      // Browser shim: not a real PKCE challenge, but enough for local compatibility.
      const codeChallenge = codeVerifier;
      const redirectURI =
        this.redirectMethod === RedirectMethod.Web
          ? 'https://raycast.com/redirect/extension'
          : this.redirectMethod === RedirectMethod.AppURI
            ? 'com.raycast:/oauth?package_name=Extension'
            : 'raycast://oauth?package_name=Extension';

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: options.clientId,
        redirect_uri: redirectURI,
        scope: options.scope,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'plain',
        ...(options.extraParameters ?? {}),
      });
      const url = `${options.endpoint}${options.endpoint.includes('?') ? '&' : '?'}${params.toString()}`;

      return {
        codeChallenge,
        codeVerifier,
        redirectURI,
        state,
        toURL: () => url,
      };
    }

    async authorize(_options: AuthorizationRequest | AuthorizationOptions): Promise<AuthorizationResponse> {
      throw new Error('OAuth.PKCEClient.authorize is not implemented in browser compatibility layer');
    }

    async setTokens(options: TokenSetOptions | TokenResponse): Promise<void> {
      this.tokenSet = normalizeTokenSet(options);
    }

    async getTokens(): Promise<TokenSet | undefined> {
      return this.tokenSet;
    }

    async removeTokens(): Promise<void> {
      this.tokenSet = undefined;
    }
  }
}
