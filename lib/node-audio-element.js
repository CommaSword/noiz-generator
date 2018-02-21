// TODO: this should be separated into a separate module
'use strict'

const uuid = require('uuid/v4')
const JSONStream = require('JSONStream')
const spawn = require('electron-spawn')

function initElectron (audios) {
  const objects = JSONStream.parse()
  const electron = spawn(`${__dirname}/electron.js`)
  objects.on('data', (data) => {
    Object.keys(data).forEach(command => {
      const params = data[command]
      const { id, val } = params
      audios[id][command] = val
    })
  })
  electron.stdout.pipe(objects)
  return electron
}

function api ({path, id, audios, electron}) {
  return new Proxy({
    play: () => {
      electron.stdin.write(JSON.stringify({play: {id}}))
    }
  }, {
    get: function (target, key) {
      return key in target ? target[key] : audios[id][key]
    },
    set: function (target, key, val) {
      audios[id][key] = val // optimistic update
      electron.stdin.write(JSON.stringify({[key]: {val, id}}))
      return true
    }
  })
}

function createAudio () {
  let audios = {}
  const electron = initElectron(audios)
  return function Audio (path) {
    const id = uuid()
    audios[id] = {}
    electron.stdin.write(JSON.stringify({open: {path, id}}))
    return api({path, id, audios, electron})
  }
}

module.exports = createAudio
