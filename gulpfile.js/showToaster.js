const notify = require('gulp-notify')
const plumber = require('gulp-plumber')

module.exports = name => plumber({
  errorHandler: (error) => {
    notify.onError({
      title: name,
      message: '<%= error.message %>'
    })(error)
  }
})
