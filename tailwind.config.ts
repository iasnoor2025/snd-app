import type { Config } from 'tailwindcss'

export default {
  content: [
    './resources/**/*.{js,ts,jsx,tsx,blade.php}',
    './Modules/**/resources/**/*.{js,ts,jsx,tsx,blade.php}',
    './storage/framework/views/*.php',
    './app/View/Components/**/*.php',
  ],
  safelist: [
    'transition-[margin-left]',
    'ml-[var(--sidebar-width)]',
    'w-[var(--sidebar-width)]',
    'w-[var(--sidebar-width-icon)]',
    'peer-data-[state=collapsed]:ml-0',
    'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
    'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]',
    'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]',
    'group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
    'group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
    },
  },
  plugins: [],
} satisfies Config 