import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────────────
        primary: '#bc000a',
        'primary-container': '#e2241f',
        'on-primary': '#ffffff',
        'on-primary-container': '#fffbff',
        'primary-fixed': '#ffdad5',
        'primary-fixed-dim': '#ffb4aa',
        'on-primary-fixed': '#410001',
        'on-primary-fixed-variant': '#930005',
        'inverse-primary': '#ffb4aa',
        'surface-tint': '#c0000a',

        // ── Secondary ──────────────────────────────────────────
        secondary: '#aa352b',
        'secondary-container': '#fd7363',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#6f0807',
        'secondary-fixed': '#ffdad5',
        'secondary-fixed-dim': '#ffb4aa',
        'on-secondary-fixed': '#410001',
        'on-secondary-fixed-variant': '#891d16',

        // ── Tertiary ───────────────────────────────────────────
        tertiary: '#00647f',
        'tertiary-container': '#007fa0',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#fafdff',
        'tertiary-fixed': '#bbe9ff',
        'tertiary-fixed-dim': '#68d3fc',
        'on-tertiary-fixed': '#001f29',
        'on-tertiary-fixed-variant': '#004d63',

        // ── Error ──────────────────────────────────────────────
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // ── Surface ────────────────────────────────────────────
        surface: '#fcf9f8',
        'surface-bright': '#fcf9f8',
        'surface-dim': '#dcd9d9',
        'surface-variant': '#e5e2e1',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f6f3f2',
        'surface-container': '#f0eded',
        'surface-container-high': '#eae7e7',
        'surface-container-highest': '#e5e2e1',

        // ── On-surface ─────────────────────────────────────────
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#5d3f3b',
        'on-background': '#1c1b1b',
        'inverse-surface': '#313030',
        'inverse-on-surface': '#f3f0ef',

        // ── Outline ────────────────────────────────────────────
        outline: '#926f6a',
        'outline-variant': '#e7bdb7',

        // ── Background / shadcn compat ─────────────────────────
        background: '#fcf9f8',
        foreground: '#1c1b1b',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
