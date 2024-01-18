import Events from 'events'
import state from './state'
import each from 'async/each'

const extensions = {}

class App extends Events {
  constructor () {
    super()

    if (App.extensions) {
      App.extensions.forEach(e => extensions[e.id] = e)
    }

    this.state = state
    this.initExtensions(() => this.init())
  }

  initExtensions (callback) {
    const loadableExtensions = Object.entries(extensions)
      .filter(([id, extension]) => {
        if (extension.done) {
          return false
        }

        if (extension.requireExtensions) {
          if (!extension.requireExtensions.filter(rId => extensions[rId] && extensions[rId].done).length) {
            return false
          }
        }

        return true
      })

    if (!loadableExtensions.length) {
      return callback()
    }

    each(loadableExtensions, ([id, extension], done) => {
      if (!extension.initFun) {
        extension.done = true
        return done()
      }

      extension.initFun(this, (err) => {
        if (err) {
          console.log('error init', id, err)
          return global.alert(err.message)
        }

        extension.done = true
        return done()
      })
    }, () => this.initExtensions(callback))
  }

  init () {
    state.on('get', state => this.emit('state-get', state))
    state.on('apply', state => this.emit('state-apply', state))

    this.emit('init')
    state.init()

    state.apply(this.options)
  }

  stateApply (s) {
    state.apply(s)
  }

  updateLink () {
    state.updateLink()
  }

  getParameter (str, fun='any') {
    const promises = []
    this.emit(str, promises)
    return Promise[fun](promises)
  }

  setNonInteractive (value) {
    this.interactive = !value
  }
}

App.addExtension = (extension) => {
  extensions[extension.id] = extension
}

module.exports = App
