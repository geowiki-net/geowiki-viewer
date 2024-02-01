import Events from 'events'
import isRelativePath from './isRelativePath'

/**
 * @typedef EntityList#file
 * @property {string} id ID of the file
 * @property {string} [title] title of the file
 * @property {string} [url] URL of the file (if any)
 * @property {Promise.<string>} [loader] promise which will resolve to an URL
 */

/**
 * base class for lists of entities (e.g. data sources, stylesheets, ...)
 */
class EntityList extends Events {
  constructor (app, config, defaultList) {
    super()
    this.app = app
    this.config = config
    this.defaultList = defaultList
    this._list = null
  }

  /**
   * list all available data source
   * @param [boolean] refresh - if true, the cache will be rebuilt
   * @returns {Promise.<EntityList#file[]>} Promise will resolve to a list of entities
   */
  list (refresh = false) {
    return new Promise((resolve, reject) => {
      if (this._list && !refresh) {
        return resolve(this._list)
      }

      this._list = this.defaultList
      if (this.config) {
        this._list = this.config.list ?? defaultList
      }

      Object.entries(this._list).forEach(([id, item]) => {
        item.id = id

        if (!item.title) {
          item.title = id
        }
      })

      const promises = []
      this.emit('list-entities', promises)
      Promise.all(promises).then(values => {
        values = values.flat(1)
        values.forEach(item => {
          if (!item.title) {
            item.title = item.id
          }

          this._list[item.id] = item
        })

        this.emit('update')
        resolve(this._list)
      })
    })
  }

  /**
   * get the datasource with the specified ID
   * @param {string} [id] the id of the data source. if null, the default (first in list) data source will be returned. if the data source is not loaded, a new data source with the URL derived from the id will be created.
   * @returns {Promise.<EntityList#file>} a promise, which will resolve to a file descriptor.
   */
  get (id) {
    return new Promise((resolve, reject) => {
      this.list().then(list => {
        if (!id) {
          if (!Object.keys(list).length) {
            return reject(new Error('no entities defined'))
          }

          id = Object.keys(list)[0]
        }

        if (!(id in list)) { // TODO: maybe need to allow additional data sources
          list[id] = {
            id,
            title: id,
            url: id
          }

          this.emit('update')
        }

        const item = list[id]

        if (!item.data) {
          if (item.loader) {
            item.loader()
              .then(url => {
                this.resolveItem(item, url).then(() => resolve(item))
              })
              .catch(err => {
                global.alert(err.message)
              })
          } else {
            const url = (isRelativePath(item.url) ? this.app.config.dataDirectory + '/' : '') + item.url

            this.resolveItem(item, url)
              .then(() => resolve(item))
          }
        } else {
          resolve(item)
        }
      })
      .catch(err => reject(err))
    })
  }
}

module.exports = EntityList
