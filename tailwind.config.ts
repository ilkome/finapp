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
        '5': 'rgb(var(--text-5))',
        'accent': {
          1: 'rgb(var(--accent-1))',
          2: 'rgb(var(--accent-2))',
          3: 'rgb(var(--accent-3))',
          4: 'var(--accent-4)',
        },
        'alert-primary': 'var(--alert-primary)',
        'expense': {
          1: 'var(--expense-1)',
        },
        'foreground': {
          1: 'rgb(var(--foreground-1))',
          2: 'rgb(var(--foreground-2))',
        },
        'icon-primary': 'var(--text-icon-primary)',
        'income': {
          1: 'var(--income-1)',
        },
        'item': {
          1: 'var(--c-item-1)',
          2: 'var(--c-item-2)',
          3: 'var(--c-item-3)',
          4: 'var(--c-item-4)',
          5: 'var(--c-item-5)',
          6: 'rgba(var(--item-6))',
          8: 'rgba(var(--item-8))',
          9: 'rgba(var(--item-9))',
          10: 'rgba(var(--item-10))',
          11: 'var(--item-11)',
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
