export async function popToRoot(_options?: { clearSearchBar?: boolean }): Promise<void> {
  if (typeof (window as any).mightyhq?.hideLauncher === 'function') {
    (window as any).mightyhq.hideLauncher();
  }
}
