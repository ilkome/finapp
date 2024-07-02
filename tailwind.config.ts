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
        'accent': {
          1: 'rgb(var(--accent-1))',
          2: 'rgb(var(--accent-2))',
          3: 'rgb(var(--accent-3))',
          4: 'var(--accent-4)',
        },
        'alert-primary': 'var(--text-alert-primary)',
        'expense': 'var(--text-expense-1)',
        'foreground': {
          1: 'rgb(var(--foreground-1))',
          2: 'rgba(var(--foreground-2))',
          3: 'rgb(var(--foreground-3))',
          4: 'rgba(var(--foreground-4))',
          5: 'rgb(var(--foreground-5))',
        },
        'icon-primary': 'var(--text-icon-primary)',
        'icon-primary2': 'var(--text-icon-primary2)',
        'income': 'var(--text-income-1)',
        'item': {
          1: 'var(--c-item-1)',
          2: 'var(--c-item-2)',
          3: 'var(--c-item-3)',
          4: 'var(--c-item-4)',
          5: 'var(--c-item-5)',
          6: 'rgba(var(--item-6))',
          7: 'rgba(var(--item-7))',
          8: 'var(--c-item-bg-hover)',
        },
        'prima': 'rgb(var(--text-prima))',
        'secondary': 'rgb(var(--text-secondary))',
        'secondary2': 'rgb(var(--text-secondary2))',
      },
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'],
        primary: ['Roboto', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
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
