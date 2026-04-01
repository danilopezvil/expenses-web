import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const rawApiOrigin =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001';

    const apiOrigin = rawApiOrigin.replace(/\/v1\/?$/, '').replace(/\/$/, '');

    return [
      {
        source: '/v1/:path*',
        destination: `${apiOrigin}/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
