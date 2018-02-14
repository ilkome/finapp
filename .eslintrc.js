module.exports = {
  extends: [
    'standard',
    'plugin:vue/recommended'
  ],

  rules: {
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }]
  },

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  }
};
