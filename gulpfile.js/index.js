/*
  ilkome frontend
  Version 4.2.2

  Ilya Komichev
  https://ilko.me
  https://github.com/ilkome/frontend
*/
const gulp = require('gulp')
const requireDir = require('require-dir')
const runSequence = require('run-sequence')
const $ = require('gulp-load-plugins')()
const watch = require('gulp-watch')
const paths = require('../config/paths')

requireDir('./tasks') // Require all tasks

// Development
gulp.task('default', (done) => {
  runSequence(
    ['clean'],
    ['images', 'pug', 'stylus', 'assets'],
    ['browserSync'],
    ['watcher'],
    done
  )
})

// Build
gulp.task('build', (done) => {
  runSequence(
    ['clean'],
    ['images', 'pug', 'stylus', 'assets'],
    done
  )
})

gulp.task('zip', () => {
  gulp.src('build/**/*')
    .pipe($.zip('build.zip'))
    .pipe(gulp.dest('./'))
})

// Watch
gulp.task('watcher', () => {
  watch(paths.assets.src, () => runSequence('assets', 'browserSync-reload'))
  watch(paths.images.src, () => runSequence('images', 'browserSync-reload'))
  watch(paths.layout.src, () => runSequence('pug', 'browserSync-reload'))
  watch(paths.stylus.src, () => gulp.start('stylus'))
})
