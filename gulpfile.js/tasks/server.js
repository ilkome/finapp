const browserSync = require('browser-sync')
const gulp = require('gulp')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const paths = require('../paths')
const webpackConfig = require('../../webpack.config')

const webpackBundler = webpack(webpackConfig)

// browserSync
gulp.task('browserSync', () => browserSync({
  server: {
    baseDir: paths.build
  },
  open: false,
  logFileChanges: false,
  notify: false,
  online: true,
  ghostMode: false,
  scrollProportionally: false,
  middleware: [
    webpackDevMiddleware(webpackBundler, {
      publicPath: webpackConfig.output.publicPath,
      stats: webpackConfig.stats
    }),
    webpackHotMiddleware(webpackBundler), (req, res, next) => {
      if (req.headers.accept && req.headers.accept.startsWith('text/html')) {
        req.url = '/index.html' // eslint-disable-line no-param-reassign
      }
      next()
    }
  ],
  files: [
    paths.js.entry
  ]
}))

// Manual reload
gulp.task('browserSync-reload', () => browserSync.reload())
