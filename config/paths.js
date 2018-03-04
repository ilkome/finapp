var path = require('path')

const appPath = path.resolve(__dirname, '../src')
const distPath = path.resolve(__dirname, '../dist')

module.exports = {
  app: appPath,
  dist: distPath,
  assets: {
    src: [
      `${appPath}/assets/**/*`,
      `!${appPath}/assets/img`,
      `!${appPath}/assets/img/**`
    ]
  },
  css: {
    styles: `${distPath}/css/styles.css`,
    src: `${distPath}/css/*.css`,
    output: `${distPath}/css`
  },
  html: {
    src: `${distPath}/*.html`
  },
  images: {
    src: [
      `${appPath}/assets/img/**/*.+(jpg|png|gif|svg)`,
      `${appPath}/atoms/**/img/**/*.+(jpg|png|gif|svg)`
    ],
    output: `${distPath}/img`
  },
  layout: {
    entry: `${appPath}/layout/layout.pug`,
    src: `${appPath}/layout/**/*.pug`
  },
  js: {
    entry: `${appPath}/main.js`,
    output: `${distPath}/js`
  },
  stylus: {
    entry: `${appPath}/stylus/index.styl`,
    src: [
      `${appPath}/stylus/**/*.styl`,
      `${appPath}/atoms/**/*.styl`,
      `${appPath}/components/**/*.styl`
    ],
    output: `${distPath}/css`
  }
}
