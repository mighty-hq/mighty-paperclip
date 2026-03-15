/**
 * Unified Navigation Hooks
 *
 * This module provides a consistent API for navigation across different routing libraries.
 * It automatically detects whether you're using Next.js or React Router and provides
 * the appropriate implementation.
 *
 * @example
 * ```tsx
 * import { useNavigate, useSearchParams } from '@mighty/hooks/useNavigation';
 *
 * function MyComponent() {
 *   const navigate = useNavigate();
 *   const [searchParams, setSearchParams] = useSearchParams();
 *
 *   const handleClick = () => {
 *     navigate('/dashboard');
 *   };
 *
 *   const category = searchParams.get('category');
 * }
 * ```
 */

'use client';

import {
  Fragment,
  type ComponentProps,
  createElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';

// Type definitions for navigation functions
// added to exports
export type NavigateFunction = (to: string, options?: NavigateOptions) => void;

// added to exports
export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

// added to exports
export interface SearchParamsAPI {
  entries: () => IterableIterator<[string, string]>;
  forEach: (callbackfn: (value: string, key: string) => void) => void;
  get: (key: string) => string | null;
  getAll: (key: string) => string[];
  has: (key: string) => boolean;
  keys: () => IterableIterator<string>;
  toString: () => string;
  values: () => IterableIterator<string>;
}

// added to exports
export type SetSearchParams = (
  params:
    | Record<string, string | string[] | undefined>
    | URLSearchParams
    | ((prev: URLSearchParams) => URLSearchParams),
  options?: { replace?: boolean }
) => void;

/**
 * Detect which routing library is available
 */
function detectRouter(): 'nextjs' | 'react-router' | 'none' {
  // Check if we're in a Next.js environment
  if (typeof window !== 'undefined') {
    try {
      // Try to access Next.js router
      const { useRouter } = require('next/navigation');
      if (useRouter) return 'nextjs';
    } catch {
      // Next.js not available
    }

    try {
      // Try to access React Router
      if (useNavigate()) return 'react-router';
    } catch {
      // React Router not available
    }
  }

  return 'none';
}

/**
 * Unified hook for navigation
 * Works with both Next.js and React Router
 *
 * @returns A navigate function that works across routing libraries
 */
// added to exports
export function useNavigate(): NavigateFunction {
  const routerType = detectRouter();

  // Next.js implementation
  if (routerType === 'nextjs') {
    try {
      const { useRouter } = require('next/navigation');
      const router = useRouter();

      return useCallback(
        (to: string, options?: NavigateOptions) => {
          if (options?.replace) {
            router.replace(to);
          } else {
            router.push(to);
          }
        },
        [router]
      );
    } catch (error) {
      console.error('Failed to use Next.js router:', error);
    }
  }

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      const { useRouter } = require('next/navigation');
      const router = useRouter();

      return useCallback(
        (to: string, options?: NavigateOptions) => {
          if (options?.replace) {
            router.replace(to);
          } else {
            router.push(to);
          }
        },
        [router]
      );
    } catch (error) {
      console.error('Failed to use React Router navigate:', error);
    }
  }

  // Fallback: try to use global store navigate function
  // try {
  //   const { useGlobalStore } = require('@mighty/core -ai/store/global');
  //   const globalNavigate = useGlobalStore.getState().navigate;

  //   if (globalNavigate) {
  //     return useCallback(
  //       (to: string, options?: NavigateOptions) => {
  //         globalNavigate(to, {
  //           replace: options?.replace,
  //           state: options?.state,
  //         });
  //       },
  //       [globalNavigate]
  //     );
  //   }
  // } catch {
  //   // Global store not available
  // }

  // Final fallback: use window.location
  return useCallback((to: string, options?: NavigateOptions) => {
    console.warn('No router available, using window.location');
    if (options?.replace) {
      window.location.replace(to);
    } else {
      window.location.href = to;
    }
  }, []);
}

/**
 * Unified hook for search params
 * Works with both Next.js and React Router
 *
 * @returns A tuple of [searchParams, setSearchParams]
 */
// added to exports
export function useSearchParams(): [SearchParamsAPI, SetSearchParams] {
  const routerType = detectRouter();

  // Next.js implementation
  if (routerType === 'nextjs') {
    try {
      const { useSearchParams: nextUseSearchParams, useRouter, usePathname } = require('next/navigation');
      const searchParams = nextUseSearchParams();
      const router = useRouter();
      const pathname = usePathname();

      const setSearchParams: SetSearchParams = useCallback(
        (
          params:
            | Record<string, string | string[] | undefined>
            | URLSearchParams
            | ((prev: URLSearchParams) => URLSearchParams),
          options?: { replace?: boolean }
        ) => {
          const current = new URLSearchParams(searchParams?.toString() || '');

          let newParams: URLSearchParams;

          if (typeof params === 'function') {
            newParams = params(current);
          } else if (params instanceof URLSearchParams) {
            newParams = params;
          } else {
            newParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value === undefined) {
                newParams.delete(key);
              } else if (Array.isArray(value)) {
                value.forEach((v) => newParams.append(key, v));
              } else {
                newParams.set(key, value);
              }
            });
          }

          const search = newParams.toString();
          const query = search ? `?${search}` : '';

          if (options?.replace) {
            router.replace(`${pathname}${query}`);
          } else {
            router.push(`${pathname}${query}`);
          }
        },
        [searchParams, router, pathname]
      );

      // Wrap Next.js searchParams to match our API
      const wrappedSearchParams: SearchParamsAPI = useMemo(
        () => ({
          get: (key: string) => searchParams?.get(key) || null,
          getAll: (key: string) => searchParams?.getAll(key) || [],
          has: (key: string) => searchParams?.has(key) || false,
          toString: () => searchParams?.toString() || '',
          entries: () => (searchParams?.entries() || [][Symbol.iterator]()) as IterableIterator<[string, string]>,
          forEach: (callbackfn: (value: string, key: string) => void) => searchParams?.forEach(callbackfn),
          keys: () => (searchParams?.keys() || [][Symbol.iterator]()) as IterableIterator<string>,
          values: () => (searchParams?.values() || [][Symbol.iterator]()) as IterableIterator<string>,
        }),
        [searchParams]
      );

      return [wrappedSearchParams, setSearchParams];
    } catch (error) {
      console.error('Failed to use Next.js searchParams:', error);
    }
  }

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      const [searchParams, setSearchParams] = useSearchParams();

      // Wrap React Router searchParams to match our API
      const wrappedSearchParams: SearchParamsAPI = useMemo(
        () => ({
          get: (key: string) => searchParams.get(key),
          getAll: (key: string) => searchParams.getAll(key),
          has: (key: string) => searchParams.has(key),
          toString: () => searchParams.toString(),
          entries: () => searchParams.entries(),
          forEach: (callbackfn: (value: string, key: string) => void) => searchParams.forEach(callbackfn),
          keys: () => searchParams.keys(),
          values: () => searchParams.values(),
        }),
        [searchParams]
      );

      const wrappedSetSearchParams: SetSearchParams = useCallback(
        (
          params:
            | Record<string, string | string[] | undefined>
            | URLSearchParams
            | ((prev: URLSearchParams) => URLSearchParams),
          options?: { replace?: boolean }
        ) => {
          if (typeof params === 'function' || params instanceof URLSearchParams) {
            setSearchParams(params as any, { replace: options?.replace || false });
          } else {
            const newParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value === undefined) {
                newParams.delete(key);
              } else if (Array.isArray(value)) {
                value.forEach((v) => newParams.append(key, v));
              } else {
                newParams.set(key, value);
              }
            });
            setSearchParams(newParams, { replace: options?.replace || false });
          }
        },
        [setSearchParams]
      );

      return [wrappedSearchParams, wrappedSetSearchParams];
    } catch (error) {
      console.error('Failed to use React Router searchParams:', error);
    }
  }

  // Fallback: use window.location.search
  const fallbackSearchParams: SearchParamsAPI = useMemo(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return {
      get: (key: string) => params.get(key),
      getAll: (key: string) => params.getAll(key),
      has: (key: string) => params.has(key),
      toString: () => params.toString(),
      entries: () => params.entries(),
      forEach: (callbackfn: (value: string, key: string) => void) => params.forEach(callbackfn),
      keys: () => params.keys(),
      values: () => params.values(),
    };
  }, []);

  const fallbackSetSearchParams: SetSearchParams = useCallback(
    (
      params:
        | Record<string, string | string[] | undefined>
        | URLSearchParams
        | ((prev: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean }
    ) => {
      console.warn('No router available for setSearchParams, this will cause a page reload');

      const current = new URLSearchParams(window.location.search);
      let newParams: URLSearchParams;

      if (typeof params === 'function') {
        newParams = params(current);
      } else if (params instanceof URLSearchParams) {
        newParams = params;
      } else {
        newParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined) {
            newParams.delete(key);
          } else if (Array.isArray(value)) {
            value.forEach((v) => newParams.append(key, v));
          } else {
            newParams.set(key, value);
          }
        });
      }

      const search = newParams.toString();
      const url = `${window.location.pathname}${search ? `?${search}` : ''}`;

      if (options?.replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }

      // Trigger a popstate event to notify listeners
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    []
  );

  return [fallbackSearchParams, fallbackSetSearchParams];
}

/**
 * Hook to get the current pathname
 * Works with both Next.js and React Router
 */
// added to exports
export function usePathname(): string {
  const routerType = detectRouter();

  // Next.js implementation
  if (routerType === 'nextjs') {
    try {
      const { usePathname: nextUsePathname } = require('next/navigation');
      return nextUsePathname();
    } catch (error) {
      console.error('Failed to use Next.js usePathname:', error);
    }
  }

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      const location = useLocation();
      return location.pathname;
    } catch (error) {
      console.error('Failed to use React Router useLocation:', error);
    }
  }

  // Fallback
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

/**
 * Location object interface matching React Router's Location type
 */
// added to exports
export interface Location {
  hash: string;
  key: string;
  pathname: string;
  search: string;
  state: any;
}

/**
 * Unified hook for getting the current location
 * Works with both Next.js and React Router
 * Returns a location object compatible with React Router's useLocation
 *
 * @returns A location object with pathname, search, hash, state, and key
 */
// added to exports
export function useLocation(): Location {
  const routerType = detectRouter();

  // Next.js implementation
  if (routerType === 'nextjs') {
    try {
      const { usePathname, useSearchParams } = require('next/navigation');
      const pathname = usePathname();
      const searchParams = useSearchParams();

      return useMemo(
        () => ({
          pathname: pathname || '/',
          search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
          hash: typeof window !== 'undefined' ? window.location.hash : '',
          state: null,
          key: 'default',
        }),
        [pathname, searchParams]
      );
    } catch (error) {
      console.error('Failed to use Next.js location:', error);
    }
  }

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      return useLocation();
    } catch (error) {
      console.error('Failed to use React Router useLocation:', error);
    }
  }

  // Fallback: use window.location
  const fallbackLocation = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
      };
    }

    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      state: null,
      key: 'default',
    };
  }, []);

  return fallbackLocation;
}

/**
 * Hook to get the current router instance
 * Primarily for Next.js compatibility
 */
// added to exports
export function useRouter() {
  const routerType = detectRouter();

  if (routerType === 'nextjs') {
    try {
      const { useRouter: nextUseRouter } = require('next/navigation');
      return nextUseRouter();
    } catch (error) {
      console.error('Failed to use Next.js useRouter:', error);
    }
  }

  if (routerType === 'react-router') {
    try {
      return useNavigate();
    } catch (error) {
      console.error('Failed to use React Router useNavigate:', error);
    }
  }

  return null;
}

/**
 * Hook to get URL parameters
 * Works with both Next.js and React Router
 *
 * @returns An object with URL parameters
 */
// added to exports
export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  const routerType = detectRouter();

  // Next.js implementation
  if (routerType === 'nextjs') {
    try {
      const { useParams: nextUseParams } = require('next/navigation');
      const params = nextUseParams();
      return (params || {}) as T;
    } catch (error) {
      console.error('Failed to use Next.js useParams:', error);
    }
  }

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      return useParams() as T;
    } catch (error) {
      console.error('Failed to use React Router useParams:', error);
    }
  }

  // Fallback: parse from window.location
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {} as T;
    }

    //const pathname = window.location.pathname;
    // This is a simple fallback - in Next.js, params come from the route structure
    // For a proper implementation, you'd need to match against route patterns
    return {} as T;
  }, []) as T;
}

/**
 * Hook to get route error (for error boundaries)
 * Works with both Next.js and React Router
 *
 * @returns The error object from the route
 */
// added to exports
export function useRouteError(): Error {
  const routerType = detectRouter();

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      return useRouteError() as Error;
    } catch (error) {
      console.error('Failed to use React Router useRouteError:', error);
    }
  }

  // Next.js doesn't have a direct equivalent, but errors are handled via error.tsx files
  // Fallback: return a generic error
  return new Error('Route error - check error.tsx file in Next.js');
}

// Re-export common navigation types for convenience
export type { NavigateOptions as NavigationOptions };

/**
 * Navigation Components
 * Wrapper components that work with both Next.js and React Router
 * Note: These components use React.createElement to avoid JSX in .ts files
 */

/**
 * Link component wrapper
 * Works with both Next.js and React Router
 */
// added to exports
export function Link({
  to,
  href,
  children,
  ...props
}: ComponentProps<'a'> & { to?: string; href?: string }): ReactElement {
  const routerType = detectRouter();
  const linkHref = to || href || '#';

  // Next.js implementation
  if (routerType === 'nextjs') {
    try {
      const NextLink = require('next/link').default;
      return createElement(NextLink, { href: linkHref, ...props }, children);
    } catch (error) {
      console.error('Failed to use Next.js Link:', error);
    }
  }

  // React Router implementation
  if (routerType === 'react-router') {
    try {
      const NextLink = require('next/link').default;
      return createElement(NextLink, { to: linkHref, ...props }, children);
    } catch (error) {
      console.error('Failed to use React Router Link:', error);
    }
  }

  // Fallback: use regular anchor tag
  return createElement('a', { href: linkHref, ...props }, children);
}

/**
 * Outlet component wrapper
 * In Next.js, this should be replaced with {children} prop in layouts
 * This is a compatibility wrapper for React Router's Outlet
 */
// added to exports
export function Outlet({ children }: { children?: React.ReactNode }): ReactElement | null {
  const routerType = detectRouter();

  // React Router implementation
  // if (routerType === 'react-router') {
  //   try {
  //     const { Outlet: RROutlet } = require('@mighty/hooks/useNavigation');
  //     return createElement(RROutlet);
  //   } catch (error) {
  //     console.error('Failed to use React Router Outlet:', error);
  //   }
  // }

  // // Next.js: Outlet should be replaced with {children} in layout components
  // // This is a fallback that returns children if provided
  // console.warn('Outlet is not available in Next.js. Use {children} prop in layout components instead.');
  return children ? (children as ReactElement) : null;
}

/**
 * Navigate component wrapper
 * Works with both Next.js and React Router
 * In Next.js, redirects are typically handled via redirect() function in server components
 * This is a compatibility wrapper for React Router's Navigate
 */
// added to exports
export function Navigate({ to, replace, state }: { to: string; replace?: boolean; state?: any }): ReactElement | null {
  // const routerType = detectRouter();

  // // React Router implementation
  // if (routerType === 'react-router') {
  //   try {
  //     const { Navigate: RRNavigate } = require('@mighty/hooks/useNavigation');
  //     return createElement(RRNavigate, { to, replace, state });
  //   } catch (error) {
  //     console.error('Failed to use React Router Navigate:', error);
  //   }
  // }

  // Next.js: Use router.push/replace instead
  // This is a client-side redirect fallback
  if (typeof window !== 'undefined') {
    const redirect = () => {
      if (replace) {
        window.location.replace(to);
      } else {
        window.location.href = to;
      }
    };
    redirect();
  }

  return null;
}

/**
 * BrowserRouter component wrapper
 * Works with both Next.js and React Router
 * In Next.js, routing is handled automatically, so this is a compatibility wrapper
 * that simply renders children. Use React Router's BrowserRouter when React Router is available.
 */
// added to exports
export function BrowserRouter({ children, ...props }: ComponentProps<'div'> & { children?: ReactNode }): ReactElement {
  // const routerType = detectRouter();

  // React Router implementation
  // if (routerType === 'react-router') {
  //   try {
  //     const { BrowserRouter: RRBrowserRouter } = require('@mighty/hooks/useNavigation');
  //     return createElement(RRBrowserRouter, props, children);
  //   } catch (error) {
  //     console.error('Failed to use React Router BrowserRouter:', error);
  //   }
  // }

  // Next.js: BrowserRouter is not needed as routing is handled by Next.js
  // This fallback just renders children
  console.warn('BrowserRouter is not needed in Next.js. Routing is handled automatically via file structure.');
  return createElement(Fragment, {}, children);
}

/**
 * Routes component wrapper
 * Works with both Next.js and React Router
 * In Next.js, routes are defined via file structure, not components
 * This is a compatibility wrapper for React Router's Routes
 */
// added to exports
export function Routes({ children }: { children?: ReactNode }): ReactElement | null {
  const routerType = detectRouter();

  // // React Router implementation
  // if (routerType === 'react-router') {
  //   try {
  //     const { Routes: RRRoutes } = require('@mighty/hooks/useNavigation');
  //     return createElement(RRRoutes, {}, children);
  //   } catch (error) {
  //     console.error('Failed to use React Router Routes:', error);
  //   }
  // }

  // Next.js: Routes are file-based, this component just renders children
  console.warn('Routes component is not used in Next.js. Routes are defined via file structure.');
  return children ? (children as ReactElement) : null;
}

/**
 * Route component wrapper
 * Works with both Next.js and React Router
 * In Next.js, routes are defined via file structure, not components
 * This is a compatibility wrapper for React Router's Route
 */
// added to exports
export function Route({
  path,
  element,
  children,
}: {
  path?: string;
  element?: ReactElement;
  children?: ReactElement | ReactElement[];
  index?: boolean;
}): ReactElement | null {
  // const routerType = detectRouter();

  // // React Router implementation
  // if (routerType === 'react-router') {
  //   try {
  //     const { Route: RRRoute } = require('@mighty/hooks/useNavigation');
  //     return createElement(RRRoute, { path, element, children });
  //   } catch (error) {
  //     console.error('Failed to use React Router Route:', error);
  //   }
  // }

  // Next.js: Routes are file-based, this component does nothing
  console.warn('Route component is not used in Next.js. Routes are defined via file structure.');
  return element || (Array.isArray(children) ? children[0] : children) || null;
}
