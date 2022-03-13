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
        blue2: '#0366d6',
        blue3: '#3a7dff',
        blue4: '#2183f2',
        custom1: '#212121',
        custom4: '#1c1c1c',
        custom5: '#1b1b1c',
        dark3: '#171717',
        dark4: '#1c1c1c',
        white1: '#fdfdfd',
        white2: '#fcfcfd',
        income: '#2cad22',
        expense: '#f92134',
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
