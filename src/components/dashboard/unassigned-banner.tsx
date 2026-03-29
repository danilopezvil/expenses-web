import Link from 'next/link';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
}

interface UnassignedBannerProps {
  count: number;
  total: number;
}

export function UnassignedBanner({ count, total }: UnassignedBannerProps) {
  if (count === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 px-5 py-4 rounded-xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-amber-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-amber-500 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium text-sm">
          <strong>{count}</strong> {count === 1 ? 'gasto sin asignar' : 'gastos sin asignar'} por{' '}
          <strong>{formatCurrency(total)}</strong>
        </span>
      </div>
      <Link
        href="/expenses?assigned=false"
        className="text-xs font-bold uppercase tracking-wider text-amber-700 hover:underline shrink-0"
      >
        Revisar ahora →
      </Link>
    </div>
  );
}
