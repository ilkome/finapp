module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:nuxt/recommended',
    '@nuxtjs/eslint-config-typescript'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': 'off',
    'no-throw-literal': 'off',
    'brace-style': [
      'error',
      'stroustrup', {
        allowSingleLine: true
      }
    ],
    curly: ['error', 'multi-or-nest', 'consistent'],
    'object-curly-spacing': ['error', 'always'],
    'template-curly-spacing': 'error'
  }
}
