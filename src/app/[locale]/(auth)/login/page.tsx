'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { debugAuthLog, diagnoseAuthError, resolveAuthApiBaseUrl } from '@/lib/utils/debug';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    debugAuthLog('Login form submit', { email: data.email });
    try {
      const res = await authApi.login(data);
      debugAuthLog('Login succeeded', { userId: res.user.id, email: res.user.email });
      setAuth(res.user, res.accessToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const serverMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const diagnosis = diagnoseAuthError(err);
      debugAuthLog('Login failed', {
        diagnosis,
        serverMessage: serverMessage ?? null,
        loginEndpoint: `${resolveAuthApiBaseUrl()}/auth/login`,
        frontendOrigin: typeof window !== 'undefined' ? window.location.origin : null,
      });
      setServerError(
        serverMessage && typeof serverMessage === 'string'
          ? `Error al iniciar sesión: ${serverMessage}`
          : diagnosis.userMessage
      );
    }
  }

  return (
    <>
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-10">
            <div className="mb-6">
              <span className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
                Apex Ledger
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Secure Access
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight font-headline text-on-surface">
              Bienvenido
            </h1>
            <p className="text-on-surface-variant mt-2 text-sm">
              Ingresa tus credenciales para acceder al ledger compartido.
            </p>
          </div>

          {/* Card */}
          <div className="bg-surface-container-lowest p-10 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@empresa.com"
                  {...register('email')}
                  className="w-full bg-surface-container-high px-4 py-4 rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline transition-all duration-200 outline-none"
                />
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/recovery"
                    className="text-xs font-semibold text-primary hover:text-primary-container transition-colors duration-200"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-surface-container-high px-4 py-4 rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline transition-all duration-200 outline-none"
                />
                {errors.password && (
                  <p className="text-xs text-error mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline font-bold py-4 rounded-lg transition-all duration-200 active:scale-[0.98] uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Ingresando...' : 'Ingresar al Ledger'}
                </button>
              </div>

              {/* Register link */}
              <div className="text-center pt-2">
                <p className="text-sm text-on-surface-variant">
                  ¿Nuevo en Apex?{' '}
                  <Link href="/register" className="text-primary font-bold hover:underline ml-1">
                    Crear cuenta
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-3 gap-4 opacity-40 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-tighter">AES-256</span>
            </div>
            <div className="flex flex-col items-center gap-2 border-x border-outline-variant/30">
              <span className="text-xs font-bold uppercase tracking-tighter">Bank Grade</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-tighter">End-to-End</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-outline-variant/30 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <div className="font-headline font-black text-on-surface">Apex Ledger</div>
          <div className="font-body text-xs uppercase tracking-widest text-on-surface-variant">
            © 2024 Apex Ledger. Structural Sincerity in Finance.
          </div>
        </div>
      </footer>
    </>
  );
}
