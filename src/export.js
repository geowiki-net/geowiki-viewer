import App from './App'

const baseModules = [
  require('./lang'),
  require('./map'),
  require('./data'),
  require('./layer'),
  require('./config'),
  require('@geowiki-net/geowiki-style-registry')
]

App.modules = [...baseModules, ...App.modules]

module.exports = App
