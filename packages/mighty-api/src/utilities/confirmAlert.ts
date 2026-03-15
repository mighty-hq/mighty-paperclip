import { Alert } from './Alert';

export async function confirmAlert(options: Alert.Options): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(options.message ? `${options.title}\n\n${options.message}` : options.title);
    if (result && options.primaryAction?.onAction) {
      options.primaryAction.onAction();
    }
    resolve(result);
  });
}
