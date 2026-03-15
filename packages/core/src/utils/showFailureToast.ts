import { Clipboard, environment, open, Toast, showToast } from '@mighty/api';

/**
 * Shows a failure Toast for a given Error.
 *
 * @example
 * ```typescript
 * import { showHUD } from "@mighty/api";
 *
 * export default async function () {
 *   try {
 *       `
 *       on run argv
 *         return "hello, " & item 1 of argv & "."
 *       end run
 *       `,
 *       ["world"]
 *     );
 *     await showHUD(res);
 *   } catch (error) {
 *     showFailureToast(error, { title: "Could not run AppleScript" });
 *   }
 * }
 * ```
 */
export function showFailureToast(
  error: unknown,
  options?: Partial<Pick<Toast.Options, 'title' | 'primaryAction' | 'message'>>
) {
  const message = error instanceof Error ? error.message : String(error);
  return showToast({
    style: Toast.Style.Failure,
    title: options?.title ?? 'Something went wrong',
    message: options?.message ?? message,
    primaryAction: options?.primaryAction ?? handleErrorToastAction(error),
    secondaryAction: options?.primaryAction ? handleErrorToastAction(error) : undefined,
  });
}

const handleErrorToastAction = (error: unknown): Toast.ActionOptions => {
  // In renderer we do not have Node fs/path; always use fallback (Copy Logs / private extension).
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
