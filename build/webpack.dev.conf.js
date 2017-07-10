const paths = require('../config/paths')
const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
  devtool: '#cheap-module-eval-source-map',
  entry: [
    './src/main.js',
    'webpack-hot-middleware/client?noInfo=true&reload=true'
  ],
  output: {
    path: path.join(__dirname, paths.js.output),
    filename: 'bundle.js',
    publicPath: '/js/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin()
  ]
})
