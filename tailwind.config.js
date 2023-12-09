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
        alert: {
          base: 'var(--color-alert-base)',
        },

        primary: 'rgb(var(--text-primary))',
        secondary: 'rgb(var(--text-secondary))',
        main: 'rgb(var(--bg-main))',
        accent: {
          default: 'rgb(var(--accent-default))',
          2: 'rgb(var(--accent-2))',
          primary: 'rgb(var(--accent-primary))',
        },

        foreground: {
          primary: 'rgba(var(--foreground-primary))',
          main: 'rgb(var(--foreground-main))',
          second: 'rgba(var(--foreground-second))',
          hover: 'rgb(var(--foreground-hover))',
          active: 'rgb(var(--foreground-active))',
        },
        item: {
          'border': 'rgba(var(--item-border))',
          'hover': 'rgba(var(--item-hover))',
          'primary': 'rgba(var(--item-primary))',
          'base': 'var(--color-item-base)',
          'base-up': 'var(--color-item-base-up)',
          'base-down': 'var(--color-item-base-down)',
          'main': {
            main: 'rgba(var(--item-main))',
            bg: 'var(--color-item-main-bg)',
            hover: 'var(--color-item-main-hover)',
            active: 'var(--color-item-main-active)',
          },
        },

        blue3: '#3a7dff',
        dark3: '#171717',
        dark4: '#1c1c1c',
        expense: '#f92134',
        income: '#2cad22',

        layout: {
          'main-up': 'var(--color-layout-main-up)',
          'main': 'var(--color-layout-main)',
        },
        icon: {
          base: 'var(--color-icon-base)',
        },
      },
      fontSize: {
        '2xs': '10px',
      },
      fontFamily: {
        nunito: ['Nunito', 'Roboto', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        unica: ['"Unica One"', '"Roboto Condensed"', 'sans-serif'],
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
    plugin(({ matchUtilities, theme }) => {
      matchUtilities({
        size: value => ({
          width: value,
          height: value,
        }),
      }, {
        values: theme('width'),
      })
    }),
  ],
}
