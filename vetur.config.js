module.exports = {
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': true
  },

  projects: [{
    root: 'finapp',
    package: 'finapp/package.json'
  }],

  globalComponents: [
    'finapp/components/**/*.vue'
  ]
}
