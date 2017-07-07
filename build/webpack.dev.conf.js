const paths = require('../config/paths')
var webpack = require('webpack')
var path = require('path')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

module.exports = merge(baseWebpackConfig, {
  entry: [
    './src/main.js',
    'webpack-hot-middleware/client?reload=true'
  ],

  output: {
    path: path.resolve(__dirname, '../public'),
    filename: '[name].js',
    publicPath: 'js/'
  },

  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin()
  ]
})
