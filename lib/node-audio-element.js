// TODO: this should be separated into a separate module
'use strict'

const uuid = require('uuid/v4')
const JSONStream = require('JSONStream')
const spawn = require('electron-spawn')

function initElectron (audios, pending) {
  const objects = JSONStream.parse()
  const electron = spawn(`${__dirname}/electron.js`)
  objects.on('data', (data) => {
    Object.keys(data).forEach(command => {
      const params = data[command]
      const { id, val, commandId } = params
      audios[id][command] = val
      if (pending[commandId]) {
        const { resolve, rejectTimeout } = pending[commandId]
        resolve(val)
        clearTimeout(rejectTimeout)
        delete pending[commandId]
      }
    })
  })
  electron.stdout.pipe(objects)
  return electron
}

function commandInstruction ({pending, id, electron}) {
  return function sendCommand (commandName, val) {
    return new Promise((resolve, reject) => {
      const commandId = uuid()
      const command = {[commandName]: {id, commandId, val}}
      const rejectTimeout = setTimeout(reject, 500) // TODO: config override
      pending[commandId] = {resolve, rejectTimeout}
      electron.stdin.write(JSON.stringify(command))
    })
  }
}

function api ({path, id, audios, electron, pending}) {
  const sendCommand = commandInstruction({pending, id, electron})
  return {
    play: () => {
      const commandName = 'play'
      return sendCommand(commandName)
    },
    loop: (val) => {
      const commandName = 'loop'
      return sendCommand(commandName, val)
    },
    volume: (val) => {
      const commandName = 'volume'
      return sendCommand(commandName, val)
    }
  }
}

function createAudio () {
  let audios = {}
  let pending = []
  const electron = initElectron(audios, pending)
  return function Audio (path) {
    const id = uuid()
    audios[id] = {}
    electron.stdin.write(JSON.stringify({open: {path, id}}))
    return api({path, id, audios, electron, pending})
  }
}

module.exports = createAudio
