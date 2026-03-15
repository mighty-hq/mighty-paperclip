import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageGetItem, storageSetItem } from '@mighty/utils';

type Theme = 'dark' | 'light' | 'system';
type Scale = 'small' | 'medium' | 'large';

interface ThemeContextType {
  resolvedTheme: 'dark' | 'light';
  scale: Scale;
  setScale: (s: Scale) => void;
  setTheme: (t: Theme) => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const scaleMap: Record<Scale, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (storageGetItem('cf-theme') as Theme) || 'dark';
}
function getInitialScale(): Scale {
  if (typeof window === 'undefined') return 'medium';
  return (storageGetItem('cf-scale') as Scale) || 'medium';
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [scale, setScaleState] = useState<Scale>(getInitialScale);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setSystemDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'dark' | 'light' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.fontSize = scaleMap[scale];
    storageSetItem('cf-theme', theme);
    storageSetItem('cf-scale', scale);
  }, [resolvedTheme, scale, theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setScale = (s: Scale) => setScaleState(s);

  return (
    <ThemeContext.Provider value={{ theme, scale, setTheme, setScale, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
