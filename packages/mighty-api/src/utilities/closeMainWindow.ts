export interface CloseMainWindowOptions {
  clearRootSearch?: boolean;
  popToRootType?: 'default' | 'immediate' | 'suspended';
}

export async function closeMainWindow(_options?: CloseMainWindowOptions): Promise<void> {
  if (typeof (window as any).mightyhq?.hideLauncher === 'function') {
    (window as any).mightyhq.hideLauncher();
  }
}
