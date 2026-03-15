import { read, write } from './storage';

const ERRORS_KEY = 'mighty_errors';

export interface LocalError {
  code: string;
  context: string;
  id: string;
  message: string;
  metadata: Record<string, unknown>;
  resolved: boolean;
  severity: 'warning' | 'error' | 'critical' | 'fatal';
  source: string;
  stackTrace: string;
  timestamp: string;
}

export function logCriticalError(error: {
  code: string;
  message: string;
  context?: string;
  severity?: LocalError['severity'];
  stackTrace?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}): LocalError {
  const entry: LocalError = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    code: error.code,
    message: error.message,
    context: error.context ?? '',
    stackTrace: error.stackTrace ?? 'No message available',
    severity: error.severity ?? 'error',
    source: error.source ?? 'client',
    metadata: error.metadata ?? {},
    resolved: false,
    timestamp: new Date().toISOString(),
  };

  const existing = read<LocalError[]>(ERRORS_KEY) ?? [];
  existing.unshift(entry);
  if (existing.length > 100) {
    existing.length = 100;
  }
  write(ERRORS_KEY, existing);

  return entry;
}

export function getLocalErrors(): LocalError[] {
  return read<LocalError[]>(ERRORS_KEY) ?? [];
}

export function clearResolvedErrors(): void {
  const errors = getLocalErrors();
  write(
    ERRORS_KEY,
    errors.filter((e) => !e.resolved)
  );
}
