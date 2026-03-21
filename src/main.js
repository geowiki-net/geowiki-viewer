import App from './App'

const baseModules = [
  require('./lang'),
  require('./map'),
  require('./dataSources'),
  require('./layers'),
  require('./config'),
  require('@geowiki-net/geowiki-style-registry').default
]

App.modules = [...baseModules, ...App.modules, ...require('../modules')]

window.onload = function () {
  window.app = new App()
}
