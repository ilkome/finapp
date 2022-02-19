const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'class',

  content: [
    './components/**/*.{js,ts}',
    './layouts/**/*.{js,ts}',
    './modules/**/*.{js,ts}',
    './pages/**/*.{js,ts}',
  ],

  theme: {
    extend: {
      colors: {
        custom1: '#212121',
        dark3: '#171717',
        dark4: '#1c1c1c',
        custom4: '#1c1c1c',
        custom5: '#1b1b1c',
        white1: '#fdfdfd',
        white2: '#fcfcfd',
        blue1: '#58a6ff',
        blue2: '#0366d6',
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
    },
  },

  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['.isNotTouchDevice &:hover', '&:active'])
    }),
  ],
}
