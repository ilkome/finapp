const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'class',
  separator: '_',

  content: [
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './modules/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
  ],

  theme: {
    extend: {
      colors: {
        232323: '#232323',
        blue1: '#58a6ff',
        blue3: '#3a7dff',
        blue4: '#2183f2',
        custom1: '#212121',
        custom4: '#1c1c1c',
        dark3: '#171717',
        dark4: '#1c1c1c',
        dark5: '#1e1e1e',
        expense: '#f92134',
        income: '#2cad22',
        white1: '#fdfdfd',
        white2: '#fcfcfd',
        white3: '#f9fafb',

        skin: {
          accent: {
            down: 'var(--color-accent-down)',
            base: 'var(--color-accent-base)',
          },
          layout: {
            'main-up': 'var(--color-layout-main-up)',
            'main': 'var(--color-layout-main)',
          },
          red: {
            base: 'var(--color-red-base)',
          },
          icon: {
            base: 'var(--color-icon-base)',
          },
          item: {
            'base': 'var(--color-item-base)',
            'base-up': 'var(--color-item-base-up)',
            'base-down': 'var(--color-item-base-down)',
            'main': {
              bg: 'var(--color-item-main-bg)',
              hover: 'var(--color-item-main-hover)',
              active: 'var(--color-item-main-active)',
            },
          },
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
      minWidth: {
        base: '320px',
      },
      screens: {
        '3sm': '360px',
        '2sm': '400px',
      },
    },
  },

  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['.isNotTouchDevice &:not(._active):hover', '&:not(._active):active'])
    }),
  ],
}
