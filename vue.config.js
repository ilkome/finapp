const path = require('path')
const baseUrl = require('./baseUrl.config')

module.exports = {
  lintOnSave: false,

  baseUrl: process.env.NODE_ENV === 'production' ? `${baseUrl}` : '/',
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src')
      }
    }
  },

  css: {
    sourceMap: true
  },

  pwa: {
    themeColor: '#1c1d21',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
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
