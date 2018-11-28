/*
  ilkome frontend vue

  Ilya Komichev
  https://ilko.me
*/
const gulp = require('gulp')
const ftp = require('vinyl-ftp')
const util = require('gulp-util')
const configFTP = require('./ftp.conf.js')

const conn = ftp.create({
  host: configFTP.host,
  user: configFTP.user,
  password: configFTP.password,
  log: util.log,
  parallel: 1
})

gulp.task('upload', () =>
  gulp.src(`dist/**/*`, { buffer: true })
    .pipe(conn.newer('/'))
    .pipe(conn.dest(configFTP.dest))
)

gulp.task('upload-min', () =>
  gulp.src(`dist/**/*.{css,js,html}`, { buffer: true })
    .pipe(conn.newer('/'))
    .pipe(conn.dest(configFTP.dest))
)
