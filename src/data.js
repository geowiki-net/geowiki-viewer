import GeowikiAPI from '@geowiki-net/geowiki-api'

import isRelativePath from './isRelativePath'
module.exports = {
  id: 'data',
  requireModules: ['map'],
  appInit
}
let app

function appInit (_app, callback) {
  app = _app

  app.on('state-apply', state => {
    if (!app.geowikiAPI || ('data' in state && state.data !== app.options.data)) {
      loadData(state.data)
      app.emit('data-defined')
    }
  })

  app.on('initial-map-view', promises => {
    promises.push(new Promise((resolve, reject) => {
      app.once('data-defined', () => {
        if (app.geowikiAPI.localOnly) {
          app.geowikiAPI.on('load', meta => {
            if (meta.bounds) {
              resolve({
                type: 'bounds',
                bounds: meta.bounds.toLeaflet()
              })
            } else {
              reject()
            }
          })
        } else {
          reject()
        }
      })
    }))
  })

  callback()
}

function loadData (path) {
  app.options.data = path

  if (isRelativePath(path)) {
    path = app.config.dataDirectory + '/' + path
  }

  app.geowikiAPI = new GeowikiAPI(path)
  app.overpassFrontend = app.geowikiAPI // compatibility

  app.geowikiAPI.on('error', err => {
    global.alert(err.statusText)
  })
}
