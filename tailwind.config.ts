import type { Config } from 'tailwindcss'

import plugin from 'tailwindcss/plugin'

export default <Partial<Config>>{
  content: [
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
  ],
  darkMode: 'class',

  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['.mouse &:not(._active):hover', '&:not(._active):active'])
      addVariant('group-hocus', ['.mouse .group:not(._active):hover &', '.group:not(._active):active &'])
    }),
  ],

  separator: ':',

  theme: {
    extend: {
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
      },
      colors: {
        '1': 'rgb(var(--text-1))',
        '2': 'rgb(var(--text-2))',
        '3': 'rgb(var(--text-3))',
        '4': 'rgb(var(--text-4))',
        'accent': {
          1: 'rgb(var(--accent-1))',
        },
        'alert': {
          1: 'var(--text-alert-1)',
        },
        'expense': {
          1: 'oklch(var(--expense-1) / <alpha-value>)',
          2: 'var(--expense-2)',
        },
        'icon-primary': 'var(--text-icon-primary)',
        'income': {
          1: 'oklch(var(--income-1) / <alpha-value>)',
          2: 'var(--income-2)',
        },
        'item': {
          1: 'rgb(var(--item-1))',
          2: 'rgba(var(--item-2))',
          3: 'var(--item-3)',
          4: 'var(--item-4)',
          5: 'var(--item-5)',
          6: 'rgba(var(--item-6))',
          7: 'var(--item-7)',
        },
      },
      fontFamily: {
        primary: 'Inter, sans-serif',
        secondary: 'Unica One, Inter, sans-serif',
        tertiary: 'Nunito, Inter, sans-serif',
      },
      fontSize: {
        '2xs': '10px',
      },
      screens: {
        '2sm': '320px',
        '3sm': '360px',
      },
    },
  },
}
