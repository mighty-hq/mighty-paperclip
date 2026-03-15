import React from 'react';
/** Stub for MenuBarExtra (menubar context) - renders children in place */

export const MenuBarExtra: React.FC<{
  icon?: unknown;
  title?: string;
  children?: React.ReactNode;
}> & {
  Item: React.FC<{ title?: string; tooltip?: string; onAction?: () => void; children?: React.ReactNode }>;
  Separator: React.FC;
} = Object.assign(({ children }: { children?: React.ReactNode }) => <>{children}</>, {
  Item: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Separator: () => null,
});
