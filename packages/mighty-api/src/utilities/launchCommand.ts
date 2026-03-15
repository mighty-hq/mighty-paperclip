export interface LaunchOptions {
  context?: Record<string, unknown>;
  fallbackText?: string;
  name: string;
  type?: 'userInitiated' | 'background';
}

export async function launchCommand(_options: LaunchOptions): Promise<void> {
  console.warn('[https://github.com] launchCommand() is not fully supported in browser context');
}
