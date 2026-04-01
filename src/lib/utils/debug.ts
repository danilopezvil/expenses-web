const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'debug']);

function normalizeValue(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

export function resolveAuthApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || '/v1';
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

export type AuthErrorDiagnosis = {
  kind: 'unauthorized' | 'forbidden' | 'cors_or_network' | 'timeout' | 'server' | 'unknown';
  userMessage: string;
  debugHint: string;
};

export function diagnoseAuthError(error: unknown): AuthErrorDiagnosis {
  const axiosLike = error as {
    code?: string;
    message?: string;
    response?: { status?: number };
    request?: unknown;
  };

  const status = axiosLike?.response?.status;
  const code = axiosLike?.code;

  if (status === 401) {
    return {
      kind: 'unauthorized',
      userMessage: 'Email o contraseña incorrectos.',
      debugHint: '401 en /auth/login: credenciales inválidas o usuario inactivo.',
    };
  }

  if (status === 403) {
    return {
      kind: 'forbidden',
      userMessage: 'No tienes permisos para ingresar con esta cuenta.',
      debugHint: '403 recibido: validar roles/permisos o estado de cuenta.',
    };
  }

  if (code === 'ECONNABORTED') {
    return {
      kind: 'timeout',
      userMessage: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
      debugHint: 'Timeout de red: revisar latencia, disponibilidad del API o proxy.',
    };
  }

  if (!status && axiosLike?.request) {
    return {
      kind: 'cors_or_network',
      userMessage: 'No se pudo conectar al servidor (posible CORS o API caída).',
      debugHint:
        'Sin status HTTP pero con request: típicamente CORS, DNS, mixed-content o backend apagado.',
    };
  }

  if (status && status >= 500) {
    return {
      kind: 'server',
      userMessage: 'El servidor respondió con un error interno.',
      debugHint: `Error ${status}: revisar logs backend para /auth/login.`,
    };
  }

  return {
    kind: 'unknown',
    userMessage: 'Error al iniciar sesión. Intenta de nuevo.',
    debugHint: 'Error no clasificado en login: revisar payload y configuración de API.',
  };
}
