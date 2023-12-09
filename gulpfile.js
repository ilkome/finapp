const fs = require('node:fs')
const ftp = require('vinyl-ftp')
const notifier = require('node-notifier')
const { src } = require('gulp')
const log = require('fancy-log')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')

function toaster(name, cb) {
  return plumber({
    errorHandler: (error) => {
      notify.onError({
        title: name,
        message: '<%= error.message %>',
      })(error)
      cb()
    },
  })
}

function uploadTask(path, cb) {
  if (fs.existsSync('./ftp.config.js')) {
    const conn = ftp.create({
      host: 'style-nes.myjino.ru',
      user: 'style-nes_finapp',
      password: '5wefrfffsdfasfd',
      dest: '/',
      log,
      parallel: 1,
    })

    return src(path)
      .pipe(toaster('Upload', cb))
      .pipe(conn.newer('/'))
      .pipe(conn.dest('/'))
  }
  else {
    notifier.notify({
      title: 'No ftp config',
      message: 'Read Readme "Setup upload task" section',
    })
    cb()
  }
}

function uploadAll(cb) {
  return uploadTask('dist/**/*.*', cb)
}

function uploadMin(cb) {
  return uploadTask('dist/**/*.{css,js,json,html}', cb)
}

// upload task
exports.uploadAll = uploadAll
exports.uploadMin = uploadMin
