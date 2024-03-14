const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'class',
  separator: '_',

  content: [
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
  ],

  theme: {
    extend: {
      colors: {
        'alert-primary': 'var(--text-alert-primary)',
        'primary': 'rgb(var(--text-primary))',
        'secondary': 'rgb(var(--text-secondary))',
        'secondary2': 'rgb(var(--text-secondary2))',
        'icon-primary': 'var(--text-icon-primary)',
        'expense': 'var(--text-expense-1)',
        'income': 'var(--text-income-1)',

        'foreground': {
          1: 'rgb(var(--foreground-1))',
          2: 'rgba(var(--foreground-2))',
          3: 'rgb(var(--foreground-3))',
          4: 'rgba(var(--foreground-4))',
          5: 'rgb(var(--foreground-5))',
        },

        'accent': {
          1: 'rgb(var(--accent-1))',
          2: 'rgb(var(--accent-2))',
          3: 'rgb(var(--accent-3))',
          4: 'var(--accent-4)',
        },

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
      },
      fontSize: {
        '2xs': '10px',
      },
      fontFamily: {
        primary: ['Roboto', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        secondary: ['"Unica One"', '"Roboto"', 'sans-serif'],
        unica: ['"Unica One"', '"Roboto"', 'sans-serif'],
      },
      screens: {
        '3sm': '360px',
        '2sm': '400px',
      },
    },
  },

  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['.mouse &:not(._active):hover', '&:not(._active):active'])
    }),
  ],
}
