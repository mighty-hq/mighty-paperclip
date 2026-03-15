export async function getSelectedText(): Promise<string> {
  return window.getSelection?.()?.toString() ?? '';
}
