import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storageGetItem, storageSetItem } from '@mighty/utils';

const DEV_EXTENSION_PATHS_KEY = 'mightyhq_dev_extension_paths';

export interface DevExtensionManifest {
  author: string;
  commands: Array<{ name: string; title: string; description: string; mode: string; action?: any; panel?: any }>;
  created_at: string;
  description: string;
  enabled: boolean;
  icon: string;
  id: string;
  name: string;
  path: string;
  preferences: any[];
  title: string;
  updated_at: string;
  version: string;
  visibility: string;
}

type DevExtensionsContextValue = {
  devExtensions: DevExtensionManifest[];
  refresh: () => Promise<void>;
};

const DevExtensionsContext = createContext<DevExtensionsContextValue>({
  devExtensions: [],
  refresh: async () => {},
});

export function DevExtensionsProvider({ children }: { children: React.ReactNode }) {
  const [devExtensions, setDevExtensions] = useState<DevExtensionManifest[]>([]);

  const refresh = useCallback(async () => {
    const mightyhq = (window as any).mightyhq;
    if (!mightyhq?.getExtensionManifests) return;
    try {
      const raw = storageGetItem(DEV_EXTENSION_PATHS_KEY);
      const paths: string[] = raw ? JSON.parse(raw) : [];
      if (paths.length === 0) {
        setDevExtensions([]);
        return;
      }
      const manifests = await mightyhq.getExtensionManifests(paths);
      setDevExtensions(manifests || []);
    } catch (e) {
      console.warn('Dev extensions refresh failed:', e);
      setDevExtensions([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const mightyhq = (window as any).mightyhq;
    if (!mightyhq?.onExtensionChanged) return;
    const unsubscribe = mightyhq.onExtensionChanged(() => {
      refresh();
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [refresh]);

  return <DevExtensionsContext.Provider value={{ devExtensions, refresh }}>{children}</DevExtensionsContext.Provider>;
}

export function useDevExtensions() {
  return useContext(DevExtensionsContext);
}
