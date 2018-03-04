const $ = require('gulp-load-plugins')()
const gulp = require('gulp')
const ftp = require('vinyl-ftp')
const paths = require('../../config/paths')
const showToaster = require('../showToaster')
const pathExists = require('path-exists')

let configFTP
const configExists = pathExists.sync('config/ftp.conf.js')
if (configExists) {
  configFTP = require('../../config/ftp.conf.js')
} else {
  configFTP = require('../../config/ftp.conf.demo.js')
}

const conn = ftp.create({
  host: configFTP.host,
  user: configFTP.user,
  password: configFTP.password,
  log: $.util.log,
  parallel: 1
})

// Upload build to server
gulp.task('upload', () =>
  gulp.src(`${paths.dist}/**/*`, { buffer: true })
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
