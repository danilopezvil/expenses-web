const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'debug']);

function normalizeValue(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') {
    return normalizeValue(process.env.NEXT_PUBLIC_DEBUG_AUTH) === 'true';
  }

  const envValue = normalizeValue(process.env.NEXT_PUBLIC_DEBUG_AUTH);
  const storageValue = normalizeValue(window.localStorage.getItem('debug:auth'));
  const queryValue = normalizeValue(new URLSearchParams(window.location.search).get('debugAuth'));

  return (
    TRUE_VALUES.has(envValue) ||
    TRUE_VALUES.has(storageValue) ||
    TRUE_VALUES.has(queryValue)
  );
}

export function debugAuthLog(message: string, data?: unknown) {
  if (!isDebugEnabled()) return;
  if (data === undefined) {
    console.info(`[auth-debug] ${message}`);
    return;
  }
  console.info(`[auth-debug] ${message}`, data);
}
