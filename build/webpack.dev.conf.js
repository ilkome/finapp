const paths = require('../config/paths')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')

module.exports = merge(baseWebpackConfig, {
  devtool: '#cheap-module-eval-source-map',
  entry: [
    './src/main.js',
    'webpack-hot-middleware/client?noInfo=true&reload=true'
  ],
  output: {
    path: paths.js.output,
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    // Generate dist index.html with correct asset hash for caching.
    new HtmlWebpackPlugin({
      filename: `${paths.dist}/index.html`,
      template: '!!pug-loader!src/layout/layout.pug',
      inject: true,
      alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin()
  ]
})
