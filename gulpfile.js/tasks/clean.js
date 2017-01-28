const gulp = require('gulp')
const del = require('del')
const paths = require('../paths')

// Clean build folder
gulp.task('clean', () => del(`${paths.build}/**/*`))
