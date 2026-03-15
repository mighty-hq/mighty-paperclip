/**
 * Open a URL or file in the default application (browser for URLs).
 * In browser/Electron renderer we use window.open.
 */
export async function open(url: string): Promise<void> {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
