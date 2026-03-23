import GeowikiAPI from '@geowiki-net/geowiki-api'
import EntityList from '@geowiki-net/geowiki-lib-app/src/EntityList.js'

const defaultList = {
  osm: {
    title: 'OpenStreetMap Overpass',
    url: 'https://overpass-api.de/api/interpreter'
  }
}

/**
 * @typedef DataSources#file
 * @property {string} id ID of the file.
 * @property {string} [title] title of the file.
 * @property {string} [url] URL of the file (if any).
 * @property {string} [filename] Filename (for file format detection).
 * @property {Promise.<string>} [loader] promise, which will resolve to an URL.
 * @property {object} [options] Additional options which will be passed to the GeowikiAPI constructor.
 * @property {GeowikiAPI} [data] When the data sources has been loaded, the reference is stored in this property.
 */

/**
 * Request list of data sources.
 * @event App#list-data-sources
 * @param {Promise.<DataSources#file[]>} promises push a promise into this array which will resolve into a list of available data sources.
 */

/**
 * Request a data source by id.
 * @event App#get-data-source
 * @param {string} id - id of the data source we are looking for
 * @param {Promise.<DataSources#file>} promises if the module might return a valid data source for the specified id, then push a promise to this array. Only the first promise to resolve will be used.
 */

/**
 * a class which keeps track of all available data sources.
 * @extends EntityList
 */
class DataSources extends EntityList {
  constructor (app) {
    super(app, app.config.dataSources, defaultList)
    this.on('update', () => app.emit('data-sources-update'))
    this.on('list-entities', promises => app.emit('list-data-sources', promises))
    this.on('get-entity', (id, promises) => app.emit('get-data-source', id, promises))

    app.on('refresh', () => {
      this.list(true)
    })
  }

  /**
   * resolves an item to its GeowikiAPI instance.
   * @param {DataSources#file} item A file descriptor
   * @param {string} url
   * @returns {Promise}
   * @private
   */
  resolveItem (item, url) {
    return new Promise((resolve) => {
      if (!item.data) {
        if (!item.options) {
          item.options = {}
        }

        // auto-detect file format
        if (item.filename && !item.options.fileFormat) {
          const formats = GeowikiAPI.fileFormats.filter(ff => ff.willLoad(item.filename))
          if (formats.length) {
            item.options.fileFormat = formats[0].id
          }
        }

        item.data = new GeowikiAPI(url, item.options)
      }

      resolve()
    })
  }
}

module.exports = DataSources
