import type { NextConfig } from 'next';
import path from 'path';

const appDir = process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep hash-based desktop routes stable (e.g. /dashboard/#/dashboard).
  // Next's default trailing-slash redirect drops hash fragments.
  skipTrailingSlashRedirect: true,
  typescript: {
    // Existing https://github.com-compat modules currently contain known TS debt.
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@mighty/api',
    '@mighty/const',
    '@mighty/core',
    '@mighty/types',
    '@mighty/ui',
    '@mighty/utils',
  ],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'node:fs/promises': path.resolve(appDir, 'src/stubs/node-fs-promises.ts'),
      'node:stream/promises': path.resolve(appDir, 'src/stubs/node-stream-promises.ts'),
      'node:child_process': path.resolve(appDir, 'src/stubs/node-child_process.ts'),
      'node:fs': path.resolve(appDir, 'src/stubs/node-fs.ts'),
      'node:path': path.resolve(appDir, 'src/stubs/node-path.ts'),
      'node:buffer': path.resolve(appDir, 'src/stubs/node-buffer.ts'),
      'node:stream': path.resolve(appDir, 'src/stubs/node-stream.ts'),
      'node:util': path.resolve(appDir, 'src/stubs/node-util.ts'),
      'node:os': path.resolve(appDir, 'src/stubs/node-os.ts'),
      'node:url': path.resolve(appDir, 'src/stubs/node-url.ts'),
      'node:string_decoder': path.resolve(appDir, 'src/stubs/node-string_decoder.ts'),
      'node:events': path.resolve(appDir, 'src/stubs/node-events.ts'),
      'node:crypto': path.resolve(appDir, 'src/stubs/node-crypto.ts'),
    };

    config.module.rules.push({
      test: /\.md$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
