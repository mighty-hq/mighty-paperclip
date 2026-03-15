import { Clipboard, environment, open, Toast } from '@mighty/api';

export const handleErrorToastAction = (error: unknown): Toast.ActionOptions => {
  // In renderer we do not have Node fs/path; always use fallback.
  const privateExtension = true;
  const title = '[Extension Name]...';
  const extensionURL = '';

  // if it's a private extension, we can't construct the URL to report the error
  // so we fallback to copying the error to the clipboard
  const fallback = environment.isDevelopment || privateExtension;

  const stack = error instanceof Error ? error?.stack || error?.message || '' : String(error);

  return {
    title: fallback ? 'Copy Logs' : 'Report Error',
    onAction(toast) {
      toast.hide();
      if (fallback) {
        Clipboard.copy(stack);
      } else {
        open(
          `https://github.com/extensions/issues/new?&labels=extension%2Cbug&template=extension_bug_report.yml&title=${encodeURIComponent(
            title
          )}&extension-url=${encodeURI(extensionURL)}&description=${encodeURIComponent(
            `#### Error:
\`\`\`
${stack}
\`\`\`
`
          )}`
        );
      }
    },
  };
};
