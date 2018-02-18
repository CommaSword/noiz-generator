// TODO: this should be separated into a separate module
'use strict'

const uuid = require('uuid/v4')
const JSONStream = require('JSONStream')
const spawn = require('electron-spawn')

let electron
let audios = {}

function api ({path, id}) {
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

function initElectron () {
  const objects = JSONStream.parse()
  objects.on('data', (data) => {
    Object.keys(data).forEach(command => {
      const params = data[command]
      const { id, val } = params
      audios[id][command] = val
    })
  })
  electron = spawn(`${__dirname}/electron.js`)
  electron.stdout.pipe(objects)
}

function Audio (path) {
  const id = uuid()
  audios[id] = {}
  if (electron) {
    electron.stdin.write(JSON.stringify({open: {path, id}}))
  } else {
    initElectron()
    electron.stdin.write(JSON.stringify({open: {path, id}}))
  }
  return api({path, id})
}

module.exports = Audio
