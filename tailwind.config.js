const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'class',

  content: [
    './components/**/*.{js,ts}',
    './layouts/**/*.{js,ts}',
    './modules/**/*.{js,ts}',
    './pages/**/*.{js,ts}'
  ],

  theme: {
    extend: {
      fontSize: {
        '2xs': '10px'
      },
      fontFamily: {
        unica: ['"Unica One"', '"Roboto Condensed"', 'sans-serif']
      },
      minWidth: {
        base: '320px'
      }
    }
  },

  variants: {
    extend: {}
  },

  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('hocus', ['.isNotTouchDevice &:hover', '&:active'])
    })
  ]
}
