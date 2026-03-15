type EnvKey =
  | 'VITE_BACKEND_URL'
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_ANON_KEY'
  | 'OPENAI_API_KEY'
  | 'VITE_OPENAI_MODEL'
  | 'VITE_OPENAI_BASE_URL';

const getImportMetaEnv = (): Record<string, string | undefined> => {
  try {
    return Function(
      'return (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};'
    )() as Record<string, string | undefined>;
  } catch {
    return {};
  }
};

const getProcessEnv = () => (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

const normalizeNextPublicKey = (key: EnvKey) => key.replace(/^VITE_/, 'NEXT_PUBLIC_');

export const readEnv = (key: EnvKey): string | undefined => {
  const viteEnv = getImportMetaEnv();
  if (viteEnv[key]) return viteEnv[key];

  const processEnv = getProcessEnv();
  if (processEnv[key]) return processEnv[key];

  const nextPublicKey = normalizeNextPublicKey(key);
  if (processEnv[nextPublicKey]) return processEnv[nextPublicKey];

  return undefined;
};

/** Resolve OPENAI_API_KEY from env or Electron main process (renderer has no process.env). */
export async function getOpenAIKey(): Promise<string | undefined> {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { mightyhq?: { getEnv?: (k: string) => Promise<string | undefined> } }).mightyhq?.getEnv
  ) {
    const v = await (
      window as unknown as { mightyhq: { getEnv: (k: string) => Promise<string | undefined> } }
    ).mightyhq.getEnv('OPENAI_API_KEY');
    return v?.trim() || undefined;
  }
  const v = readEnv('OPENAI_API_KEY');
  return v?.trim();
}
