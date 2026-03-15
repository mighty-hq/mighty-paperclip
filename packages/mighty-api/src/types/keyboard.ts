export type KeyModifier = 'cmd' | 'ctrl' | 'opt' | 'shift';

export type KeyEquivalent =
  | string
  | 'arrowDown'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowUp'
  | 'backspace'
  | 'delete'
  | 'end'
  | 'enter'
  | 'escape'
  | 'home'
  | 'return'
  | 'space'
  | 'tab';

export interface Shortcut {
  key: KeyEquivalent;
  modifiers: KeyModifier[];
}
