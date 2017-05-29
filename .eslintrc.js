module.exports = {
  'extends': 'vue',
  'rules': {
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }]
  },
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  }
};
