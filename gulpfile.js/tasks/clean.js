const gulp = require('gulp')
const del = require('del')
const paths = require('../../config/paths')

// Clean build folder
gulp.task('clean', () => del(`${paths.dist}/**/*`))
