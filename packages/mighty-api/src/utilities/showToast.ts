import type { ToastInstance } from '../components/Toast';
import { Toast } from '../components/Toast';

export type ToastOptions = Toast.Options;

let toastHandler: ((opts: Toast.Options) => Promise<ToastInstance>) | null = null;

export function setShowToastHandler(handler: (opts: Toast.Options) => Promise<ToastInstance>): void {
  toastHandler = handler;
}

export async function showToast(
  optionsOrStyle: Toast.Options | Toast.Style,
  title?: string,
  message?: string
): Promise<ToastInstance> {
  const opts: Toast.Options =
    typeof optionsOrStyle === 'object' ? optionsOrStyle : { style: optionsOrStyle, title: title ?? '', message };

  if (toastHandler) {
    return toastHandler(opts);
  }
  // Fallback: console in browser/Electron if no handler registered
  console.log('[Toast]', opts.style ?? 'default', opts.title, opts.message ?? '');
  const fallback: ToastInstance = {
    style: opts.style ?? Toast.Style.Success,
    title: opts.title,
    message: opts.message,
    async show() {},
    async hide() {},
  };
  return fallback;
}
