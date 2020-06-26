module.exports = {
  extends: [
    'stylelint-plugin-stylus/standard'
  ],
  plugins: [
    'stylelint-order'
  ],

  rules: {
    indentation: 2,
    'declaration-block-trailing-semicolon': 'never',
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',
    'function-url-quotes': 'never',
    'no-duplicate-selectors': true,
    'rule-empty-line-before': [
      'always', {
        except: ['first-nested'],
        ignore: ['after-comment']
      }],
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-attribute-quotes': 'always',
    'string-quotes': 'double',
    'stylus/at-rule-empty-line-before': [
      'always', {
        except: ['blockless-after-same-name-blockless'],
        ignore: ['after-comment']
      }],
    'stylus/at-rule-no-unknown': true,
    'stylus/declaration-colon': 'never',
    'stylus/number-leading-zero': 'never',
    'stylus/property-no-unknown': true,
    'stylus/pythonic': 'always',
    'stylus/selector-list-comma': 'never',
    'stylus/selector-type-no-unknown': true,
    'stylus/semicolon': 'never',
    'stylus/single-line-comment-no-empty': true,
    'stylus/single-line-comment': 'always',

    'order/order': [
      'custom-properties',
      'declarations'
    ],

    'order/properties-order': [
      'overflow',
      'z-index',
      'cursor',
      'opacity',
      'position',
      'top',
      'left',
      'right',
      'bottom',
      'display',
      'align-items',
      'justify-content',
      'grid-grid-template-columns',
      'row-gap',
      'row-column',
      'width',
      'height',
      'max-width',
      'max-height',
      'min-height',
      'min-width',
      'margin',
      'padding',
      'color',
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'text-align',
      'text-transform',
      'text-decoration',
      'background',
      'border',
      'border-radius',
      'box-shadow',
      'transform',
      'transition',
      'list-style',
      'object-fit',
      'filter'
    ]
  }
}
