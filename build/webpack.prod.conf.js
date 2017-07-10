const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.conf')
const paths = require('../config/paths')

module.exports = merge(baseWebpackConfig, {
  entry: {
    app: paths.js.entry
  },

  devtool: false,

  output: {
    path: paths.js.output,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' }
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      sourceMap: false
    }),

    // Split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // Any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),

    // Extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),

    // Generate dist index.html with correct asset hash for caching.
    new HtmlWebpackPlugin({
      filename: `${paths.dist}/index.html`,
      template: `${paths.dist}/index.html`,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      // Necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    })
  ]
})
