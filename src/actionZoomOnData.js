module.exports = {
  id: 'zoom-on-data',
  appInit (app) {
    app.on('layer-selector-layer-actions', (div, leafletGeowikiLayer) => {
      const button = document.createElement('div')
      button.className = 'action disabled'
      button.innerHTML = '<i class="fa-solid fa-arrows-to-circle" title="Zoom on data"></i>'
      div.appendChild(button)

      if (leafletGeowikiLayer.geowikiAPI) {
        show(button, leafletGeowikiLayer.geowikiAPI)
      }

      leafletGeowikiLayer.on('layer-show', () => {
        show(button, leafletGeowikiLayer.geowikiAPI)
      })

      leafletGeowikiLayer.on('layer-hide', () => {
        hide(button)
      })

      button.onclick = () => {
        leafletGeowikiLayer.geowikiAPI.getMeta((err, meta) => {
          if (meta.bounds) {
            app.map.flyToBounds(meta.bounds.toLeaflet())
          }
        })
      }
    })
  }
}

function show (button, geowikiAPI) {
  geowikiAPI.getMeta((err, meta) => {
    if (meta.bounds) {
      button.classList.remove('disabled')
    }
  })
}

function hide (button) {
  button.classList.add('disabled')
}
