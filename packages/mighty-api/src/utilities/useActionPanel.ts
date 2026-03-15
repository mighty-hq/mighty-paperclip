/** @deprecated No alternative */
export interface ActionPanelState {
  update: (actionPanel: React.ReactNode) => void;
}

/** @deprecated No alternative */
export function useActionPanel(): ActionPanelState {
  return {
    update: () => {},
  };
}
