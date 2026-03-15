import type { PathLike } from '../types/common';

export namespace Clipboard {
  export type Content = { text: string } | { file: PathLike } | { html: string; text?: string };

  export type ReadContent = {
    text: string;
    file?: string;
    html?: string;
  };

  export type CopyOptions = {
    /** @deprecated Use concealed instead */
    transient?: boolean;
    concealed?: boolean;
  };

  export async function copy(content: string | number | Content, _options?: CopyOptions): Promise<void> {
    const text =
      typeof content === 'string' || typeof content === 'number'
        ? String(content)
        : 'text' in content
          ? content.text
          : 'html' in content
            ? (content.text ?? content.html)
            : '';
    await navigator.clipboard.writeText(text ?? '');
  }

  export async function clear(): Promise<void> {
    await navigator.clipboard.writeText('');
  }

  export async function paste(content: string | number | Content): Promise<void> {
    const text =
      typeof content === 'string' || typeof content === 'number'
        ? String(content)
        : 'text' in content
          ? content.text
          : 'html' in content
            ? (content.text ?? content.html)
            : '';
    await navigator.clipboard.writeText(text ?? '');
    // In browser/Electron we can't programmatically paste into another app.
    // User would use Ctrl+V. We've copied to clipboard.
  }

  export async function read(options?: { offset?: number }): Promise<ReadContent> {
    const text = await navigator.clipboard.readText();
    return { text };
  }

  export async function readText(options?: { offset?: number }): Promise<string | undefined> {
    return navigator.clipboard.readText();
  }
}
