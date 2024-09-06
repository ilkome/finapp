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
        video: '16 / 9',
      },
      colors: {
        '1': 'rgb(var(--text-1))',
        '3': 'rgb(var(--text-3))',
        '4': 'rgb(var(--text-4))',
        '5': 'rgb(var(--text-5))',
        'accent': {
          1: 'rgb(var(--accent-1))',
          2: 'rgb(var(--accent-2))',
          3: 'rgb(var(--accent-3))',
          4: 'var(--accent-4)',
        },
        'alert-primary': 'var(--text-alert-primary)',
        'expense': {
          1: 'var(--text-expense-1)',
          2: 'var(--text-expense-2)',
        },
        'foreground': {
          1: 'rgb(var(--foreground-1))',
          2: 'rgb(var(--foreground-2))',
          3: 'rgb(var(--foreground-3))',
          5: 'rgb(var(--foreground-5))',
        },
        'icon-primary': 'var(--text-icon-primary)',
        'income': {
          1: 'var(--text-income-1)',
          2: 'var(--text-income-2)',
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
        },
        'secondary': 'rgb(var(--text-secondary))',
        'secondary2': 'rgb(var(--text-secondary2))',
      },
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'],
        nunito: ['Nunito', 'Roboto', 'sans-serif'],
        primary: ['"Roboto"', 'sans-serif'],
        roboto: ['"Roboto"', 'sans-serif'],
        secondary: ['"Unica One"', '"Roboto"', 'sans-serif'],
        unica: ['"Unica One"', '"Roboto"', 'sans-serif'],
      },
      fontSize: {
        '2xs': '10px',
      },
      screens: {
        '2sm': '400px',
        '3sm': '360px',
        '4sm': '320px',
      },
    },
  },
}
