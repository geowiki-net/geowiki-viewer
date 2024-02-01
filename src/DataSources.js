import OverpassFrontend from 'overpass-frontend'
import EntityList from './EntityList'

const defaultList = {
  osm: {
    title: 'OpenStreetMap Overpass',
    url: 'https://overpass-api.de/api/interpreter'
  }
}

module.exports = class DataSources extends EntityList {
  constructor (app) {
    super(app, app.config.dataSources, defaultList)
    this.on('update', () => app.emit('data-sources-update'))
    this.on('list-entities', promises => app.emit('list-data-sources', promises))

    app.on('refresh', () => {
      this.list(true)
    })
  }

  resolveItem (item, url) {
    return new Promise((resolve) => {
      if (!item.data) {
        item.data = new OverpassFrontend(url, item.options)
      }

      resolve()
    })
  }
}
