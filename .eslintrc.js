module.exports = {
  root: true,

  env: {
    node: true
  },

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },

  extends: [
    'plugin:vue/recommended',
    '@vue/standard'
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'brace-style': [
      'error',
      'stroustrup',
      {
        allowSingleLine: true
      }
    ],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
