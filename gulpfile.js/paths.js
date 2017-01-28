const app = './app'
const build = './build'

module.exports = {
  app,
  build,
  assets: {
    src: [
      `${app}/assets/**/*`,
      `!${app}/assets/img`
    ]
  },
  css: {
    styles: `${build}/css/styles.css`,
    src: `${build}/css/*.css`,
    output: `${build}/css`
  },
  html: {
    src: `${build}/*.html`
  },
  images: {
    src: [
      `${app}/assets/img/**/*.+(jpg|png|gif|svg)`,
      `${app}/atoms/**/img/**/*.+(jpg|png|gif|svg)`
    ],
    output: `${build}/img`
  },
  layout: {
    entry: `${app}/layout/layout.pug`,
    src: `${app}/layout/**/*.pug`
  },
  js: {
    entry: `${app}/js/main.js`,
    output: `${build}/js`
  },
  stylus: {
    entry: `${app}/stylus/index.styl`,
    src: [
      `${app}/stylus/**/*.styl`,
      `${app}/atoms/**/*.styl`
    ],
    output: `${build}/css`
  }
}
