const fs = require('fs')
const ftp = require('vinyl-ftp')
const notifier = require('node-notifier')
const { src } = require('gulp')
const log = require('fancy-log')
const notify = require('gulp-notify')
const plumber = require('gulp-plumber')

function toaster (name, cb) {
  return plumber({
    errorHandler: (error) => {
      notify.onError({
        title: name,
        message: '<%= error.message %>'
      })(error)
      cb()
    }
  })
}

function uploadTask (path, cb) {
  if (fs.existsSync('./ftp.config.js')) {
    const configFTP = require('./ftp.config.js')
    const conn = ftp.create({
      host: configFTP.host,
      user: configFTP.user,
      password: configFTP.password,
      log,
      buffer: false
    })

    return src(path)
      .pipe(toaster('Upload', cb))
      .pipe(conn.newer(configFTP.dest))
      .pipe(conn.dest(configFTP.dest))
  }
  else {
    notifier.notify({
      title: 'No ftp config',
      message: 'Read Readme "Setup upload task" section'
    })
    cb()
  }
}

function uploadAll (cb) {
  return uploadTask('dist/**/*.*', cb)
}

function uploadMin (cb) {
  return uploadTask('dist/**/*.{css,js,html}', cb)
}

// upload task
exports.uploadAll = uploadAll
exports.uploadMin = uploadMin
