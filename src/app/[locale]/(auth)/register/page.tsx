'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authApi } from '@/lib/api/auth.api';

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterForm) {
    setServerError(null);
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push('/dashboard');
    } catch {
      setServerError('Error al crear la cuenta. Intenta de nuevo.');
    }
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-extrabold tracking-tight font-headline text-on-surface">
            Apex Ledger
          </div>
          <Link
            href="/login"
            className="bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm hover:bg-primary-container transition-all duration-200 uppercase tracking-widest"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-lg shadow-sm relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

            <div className="mb-10 relative">
              <h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface mb-2 leading-none">
                Únete al Ledger.
              </h1>
              <p className="text-on-surface-variant text-sm">
                Precisión estructural en las finanzas compartidas.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Juan García"
                  {...register('name')}
                  className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none"
                />
                {errors.name && (
                  <p className="text-xs text-error mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@empresa.com"
                  {...register('email')}
                  className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none"
                />
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none"
                  />
                  {errors.password && (
                    <p className="text-xs text-error mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                  >
                    Confirmar
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline/60 text-on-surface outline-none"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/70 italic">
                Mínimo 8 caracteres, una mayúscula y un número.
              </p>

              {/* Server error */}
              {serverError && (
                <div className="bg-error-container text-on-error-container text-sm rounded-lg px-4 py-3">
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-lg hover:bg-primary-container transition-all duration-200 active:scale-95 uppercase tracking-[0.2em] text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>

            {/* Footer del card */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-[10px] font-mono text-outline/50 uppercase tracking-tighter">
                POST /v1/auth/register
              </span>
              <Link
                href="/login"
                className="text-xs font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-widest"
              >
                Volver al Login
              </Link>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-8 pl-4 border-l-2 border-primary/20 max-w-xs">
            <p className="text-[11px] text-on-surface-variant leading-loose italic">
              GastoCompartido vía Apex Ledger: automatizando la equidad en las finanzas compartidas.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-low w-full py-8 border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <div className="font-headline font-black text-on-surface uppercase tracking-tight">
            Apex Ledger
          </div>
          <div className="font-body text-xs uppercase tracking-widest text-on-surface-variant">
            © 2024 Apex Ledger. Structural Sincerity in Finance.
          </div>
        </div>
      </footer>
    </>
  );
}
