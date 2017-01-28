const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const paths = require('../paths')
const showToaster = require('../showToaster')

// Сopy everything to build folder
gulp.task('assets', () =>
  gulp.src(paths.assets.src)
    .pipe(showToaster('assets'))
    .pipe($.changed(paths.build))
    .pipe($.debug({ title: 'assets:' }))
    .pipe(gulp.dest(paths.build))
)
