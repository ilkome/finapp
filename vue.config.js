const path = require('path')
const baseUrl = require('./baseUrl.config')

module.exports = {
  lintOnSave: false,

  publicPath: process.env.NODE_ENV === 'production'
    ? `${baseUrl}`
    : '/',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src')
      }
    }
  },
  productionSourceMap: false,
  css: {
    sourceMap: process.env.NODE_ENV !== 'production'
  },

  pwa: {
    themeColor: '#1c1d21',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,

      runtimeCaching: [{
        urlPattern: new RegExp('^https://fonts.googleapis.com/'),
        handler: 'cacheFirst'
      }, {
        urlPattern: new RegExp('^https://fonts.gstatic.com/'),
        handler: 'cacheFirst'
      }, {
        urlPattern: new RegExp('^https://maxcdn.bootstrapcdn.com/'),
        handler: 'cacheFirst'
      }, {
        urlPattern: new RegExp('^https://cdnjs.cloudflare.com/'),
        handler: 'cacheFirst'
      }, {
        urlPattern: new RegExp('^https://netdna.bootstrapcdn.com/'),
        handler: 'cacheFirst'
      }, {
        urlPattern: new RegExp('^https://cdn.materialdesignicons.com/'),
        handler: 'cacheFirst'
      }, {
        urlPattern: new RegExp('^https://cdnjs.cloudflare.com/'),
        handler: 'cacheFirst'
      }]
    }
  }
}
