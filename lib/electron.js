// TODO: this should be separated into a separate module
'use strict'

const fs = require('fs')
const JSONStream = require('JSONStream')

const audioUriPrefix = 'data:audio/mp3;base64,'

module.exports = function (data) {
  let files = {}
  const { stdin, stdout } = require('electron').remote.process
  const objects = JSONStream.parse()
  stdin.pipe(objects)
  objects.on('data', (d) => {
    const data = d
    Object.keys(data).forEach(command => {
      const params = data[command]
      if (command === 'open') {
        const {id, path} = params
        const blob = fs.readFileSync(path)
        const base64 = Buffer.from(blob).toString('base64')
        const uri = audioUriPrefix + base64
        files[id] = new Audio(uri)
      } else if (command === 'play') {
        const {id, commandId} = params
        files[id].play()
        stdout.write(JSON.stringify({[command]: {id, commandId}}))
      } else if (command === 'loop') {
        const {id, val, commandId} = params
        files[id].loop = val
        stdout.write(JSON.stringify({[command]: {id, val, commandId}}))
      } else {
        const {id, val, commandId} = params
        files[id][command] = val
        stdout.write(JSON.stringify({[command]: {id, val, commandId}}))
      }
    })
  })
}
