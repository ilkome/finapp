const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const path = require('path')
const paths = require('./gulpfile.js/paths')

const isProd = process.env.NODE_ENV === 'production'
const plugins = []
const entry = ['babel-polyfill', paths.js.entry] // babel-polyfill for async/await

// Production
if (isProd) {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  )
}

// Development
if (!isProd) {
  entry.push(
    'webpack-hot-middleware/client?reload=true'
  )
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  )
}

module.exports = {
  devtool: isProd ? false : '#cheap-module-eval-source-map',
  stats: {
    colors: true,
    assets: false,
    version: false,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false
  },
  entry,
  output: {
    path: path.join(__dirname, paths.js.output),
    publicPath: '/js/',
    filename: 'bundle.js'
  },
  plugins,

  resolve: {
    modules: [
      path.join(__dirname, 'app'),
      'node_modules'
    ],
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },

  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { modules: false }]
          ]
        }
      }]
    }, {
      test: /\.vue$/,
      use: ['vue-loader']
    }]
  }
}
