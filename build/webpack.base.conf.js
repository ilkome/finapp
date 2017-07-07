const paths = require('../config/paths')

module.exports = {
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },

  module: {
    rules: [{
      test: /\.vue$/,
      use: 'vue-loader'
    }, {
      test: /\.js$/,
      use: 'babel-loader',
      include: paths.app
    }]
  }
}
