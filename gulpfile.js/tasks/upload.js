const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const ftp = require('vinyl-ftp')
const configFTP = require('../../ftp.config')
const paths = require('../paths')
const showToaster = require('../showToaster')

const conn = ftp.create({
  host: configFTP.host,
  user: configFTP.user,
  password: configFTP.password,
  log: $.util.log
})

// Upload build to server
gulp.task('upload', () =>
  gulp.src(`${paths.build}/**/*`, { buffer: false })
    .pipe(showToaster('upload'))
    .pipe(conn.newer('/'))
    .pipe(conn.dest(configFTP.dest))
)
