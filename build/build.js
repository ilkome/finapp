process.env.NODE_ENV = 'production'

const ora = require('ora')
const chalk = require('chalk')
const rm = require('rimraf')
const webpack = require('webpack')
const webpackConfig = require('./webpack.prod.conf')
const paths = require('../config/paths')

const spinner = ora('building for production...')
spinner.start()

rm(paths.js.output, err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      timings: true,
      assets: true,
      version: false,
      hash: false,
      modules: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('Build complete.\n'))
  })
})
