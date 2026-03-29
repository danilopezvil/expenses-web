import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Expenses</h1>
      <nav className="flex gap-4 flex-wrap justify-center">
        <a href="/dashboard" className="text-blue-600 hover:underline">{t('dashboard')}</a>
        <a href="/expenses" className="text-blue-600 hover:underline">{t('expenses')}</a>
        <a href="/accounts" className="text-blue-600 hover:underline">{t('accounts')}</a>
        <a href="/members" className="text-blue-600 hover:underline">{t('members')}</a>
        <a href="/payments" className="text-blue-600 hover:underline">{t('payments')}</a>
        <a href="/reports" className="text-blue-600 hover:underline">{t('reports')}</a>
      </nav>
    </main>
  );
}
