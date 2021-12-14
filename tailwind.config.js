const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './components/**/*.{js,ts}',
    './layouts/**/*.{js,ts}',
    './modules/**/*.{js,ts}',
    './pages/**/*.{js,ts}'
  ],

  theme: {
    extend: {
      minWidth: {
        base: '320px'
      },
      height: {
        0: '0'
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
