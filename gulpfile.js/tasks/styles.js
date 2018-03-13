const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const browserSync = require('browser-sync')
const paths = require('../../config/paths')
const showToaster = require('../showToaster')

const isDevelopment = process.env.NODE_ENV !== 'production'

// Stylus
gulp.task('stylus', () =>
  gulp.src(paths.stylus.entry)
    .pipe(showToaster('stylus'))
    .pipe($.debug({ title: process.env.NODE_ENV }))
    .pipe($.if(isDevelopment, $.sourcemaps.init()))
    .pipe($.stylus({
      paths: ['node_modules']
    }))
    .pipe($.rename({ basename: 'styles' }))
    .pipe($.if(!isDevelopment, $.hashFilename()))
    .pipe($.if(isDevelopment, $.sourcemaps.write('./')))
    .pipe(gulp.dest(paths.stylus.output))
    .pipe(browserSync.stream({ match: '**/*.css' }))
)

// Minify CSS in build folder
gulp.task('css', () =>
  gulp.src(paths.css.src)
    .pipe(showToaster('css-min'))
    .pipe($.debug({ title: 'css-min:' }))
    .pipe($.combineMq({ beautify: false }))
    .pipe($.cleanCss({ keepSpecialComments: 0 }))
    .pipe($.autoprefixer('last 2 version', 'ie 10'))
    .pipe(gulp.dest(paths.css.output))
    .pipe(browserSync.stream({ match: '**/*.css' }))
)
