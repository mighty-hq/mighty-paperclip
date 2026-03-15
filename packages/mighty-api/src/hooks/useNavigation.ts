import { useCallback, useState } from 'react';

export interface Navigation {
  pop: () => void;
  push: (component: React.ReactNode) => void;
}

export function useNavigation(): Navigation {
  const [, setStack] = useState<React.ReactNode[]>([]);
  const push = useCallback((component: React.ReactNode) => {
    setStack((s) => [...s, component]);
  }, []);
  const pop = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);
  return { push, pop };
}
