const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const pngquant = require('imagemin-pngquant')
const paths = require('../paths')
const showToaster = require('../showToaster')

// Minify images
gulp.task('images', () =>
  gulp.src(paths.images.src)
    .pipe(showToaster('images'))
    .pipe($.flatten())
    .pipe($.changed(paths.images.output))
    .pipe($.debug({ title: 'images:' }))
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [
          { removeViewBox: false },
          { cleanupIDs: true }
      ],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.images.output))
)
