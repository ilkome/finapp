const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const path = require('path')
const paths = require('./gulpfile.js/paths')

const isProd = process.env.NODE_ENV === 'production'
const plugins = []
const entry = ['babel-polyfill', paths.js.entry] // babel-polyfill for async/await

if (isProd) {
  // Production
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false
    })
  )
} else {
  // Development
  entry.push(
    'webpack-hot-middleware/client?reload=true'
  )
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()

    // extract vendor chunks for better caching
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module) {
    //     // a module is extracted into the vendor chunk if...
    //     return (
    //       // it's inside node_modules
    //       /node_modules/.test(module.context) &&
    //       // and not a CSS file (due to extract-text-webpack-plugin limitation)
    //       !/\.css$/.test(module.request)
    //     )
    //   }
    // }),
    // // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // // on every build.
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest'
    // })
  )
}

module.exports = {
  devtool: isProd ? false : '#cheap-module-source-map',

  stats: {
    noInfo: true,
    colors: true,
    assets: false,
    version: false,
    hash: false,
    timings: false,
    chunks: true,
    chunkModules: false
  },
  entry,
  output: {
    path: path.resolve(__dirname, paths.js.output),
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
      vue$: isProd ? 'vue/dist/vue.runtime.esm.js' : 'vue/dist/vue.esm.js'
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
