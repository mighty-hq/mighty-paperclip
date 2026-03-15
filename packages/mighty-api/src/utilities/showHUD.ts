let hudHandler: ((title: string) => Promise<void>) | null = null;

export function setShowHUDHandler(handler: (title: string) => Promise<void>): void {
  hudHandler = handler;
}

export async function showHUD(
  title: string,
  _options?: { clearRootSearch?: boolean; popToRootType?: unknown }
): Promise<void> {
  if (hudHandler) {
    await hudHandler(title);
    return;
  }
  // Fallback: show briefly in console or could integrate with app toast
  console.log('[HUD]', title);
}
