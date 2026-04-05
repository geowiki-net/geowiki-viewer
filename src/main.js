import App from '@geowiki-net/geowiki-lib-app'

const baseModules = [
  require('./lang'),
  require('@geowiki-net/geowiki-lib-leaflet'),
  require('./dataSources'),
  require('./layers'),
  require('./config'),
  require('@geowiki-net/geowiki-style-registry').default
]

App.modules = [...baseModules, ...App.modules, ...require('../modules')]

window.onload = function () {
  window.app = new App()

  window.app.initModules(err => {
    if (err) { global.alert(err) }
    app.init()

    app.loadCssFiles()
  })
}
