const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const ftp = require('vinyl-ftp')
const configFTP = require('../../config/ftp.conf')
const paths = require('../../config/paths')
const showToaster = require('../showToaster')

const conn = ftp.create({
  host: configFTP.host,
  user: configFTP.user,
  password: configFTP.password,
  log: $.util.log
})

// Upload build to server
gulp.task('upload', () =>
  gulp.src(`${paths.dist}/**/*`, { buffer: false })
    .pipe(showToaster('upload'))
    .pipe(conn.newer('/'))
    .pipe(conn.dest(configFTP.dest))
)

gulp.task('upload-min', () =>
  gulp.src(`${paths.dist}/**/*.{css,js,html}`, { buffer: true })
    .pipe(showToaster('upload'))
    .pipe(conn.newer('/'))
    .pipe(conn.dest(configFTP.dest))
)
