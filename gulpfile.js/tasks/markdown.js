const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const paths = require('../../config/paths')
const showToaster = require('../showToaster')

// Jade
gulp.task('pug', () =>
  gulp.src(paths.layout.entry)
    .pipe(showToaster('pug'))
    .pipe($.debug({ title: 'pug:' }))
    .pipe($.pug())
    .pipe($.rename({ basename: 'index' }))
    .pipe(gulp.dest(paths.dist))
)
