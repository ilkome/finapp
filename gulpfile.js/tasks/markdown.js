const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const paths = require('../paths')
const showToaster = require('../showToaster')

// Jade
gulp.task('pug', () =>
  gulp.src(paths.layout.entry)
    .pipe(showToaster('pug'))
    .pipe($.debug({ title: 'pug:' }))
    .pipe($.pug())
    .pipe($.rename({ basename: 'index' }))
    .pipe(gulp.dest(paths.build))
)

// HTML
gulp.task('html', () =>
  gulp.src(paths.html.src)
    .pipe(showToaster('html'))
    .pipe($.debug({ title: 'html:' }))
    .pipe($.jsbeautifier({
      debug: false,
      indent_char: ' ',
      indent_size: 2,
      html: {
        unformatted: ['sub', 'sup', 'b', 'i', 'u']
      }
    }))
    .pipe(gulp.dest(paths.build))
)
