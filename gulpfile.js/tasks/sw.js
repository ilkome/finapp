const gulp = require('gulp')
const swPrecache = require('sw-precache')
const paths = require('../../config/paths')

function writeServiceWorkerFile(handleFetch, callback) {
  swPrecache.write(`${paths.dist}/service-worker.js`, {
    staticFileGlobs: [paths.dist + '/**/*.{js,css,png,jpg,gif,svg,eot,ttf,woff}'],
    stripPrefix: paths.dist,
    // If handleFetch is false (i.e. because this is called from generate-service-worker-dev), then
    // the service worker will precache resources but won't actually serve them.
    // This allows you to test precaching behavior without worry about the cache preventing your
    // local changes from being picked up during the development cycle.
    handleFetch: handleFetch,
    runtimeCaching: [{
      urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
      handler: 'cacheFirst'
    }, {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
      handler: 'cacheFirst'
    }, {
      urlPattern: /^https:\/\/netdna\.bootstrapcdn\.com\//,
      handler: 'cacheFirst'
    }, {
      urlPattern: /^https:\/\/cdn\.materialdesignicons\.com\//,
      handler: 'cacheFirst'
    }, {
      urlPattern: /^https:\/\/cdn\.cloudflare\.com\//,
      handler: 'cacheFirst'
    }]
  }, callback)
}

gulp.task('generate-service-worker-dev', function (callback) {
  writeServiceWorkerFile(false, callback)
})

gulp.task('generate-service-worker-dist', function (callback) {
  writeServiceWorkerFile(true, callback)
})
