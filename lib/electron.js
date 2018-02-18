// TODO: this should be separated into a separate module
'use strict'

const fs = require('fs')
const JSONStream = require('JSONStream')

const audioUriPrefix = 'data:audio/mp3;base64,'
let files = {}

module.exports = function (data) {
  const stdin = require('electron').remote.process.stdin
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
        const {id} = params
        files[id].play()
      } else {
        const {id, val} = params
        files[id][command] = val
        process.stdout.write(JSON.stringify({[command]: {id, val}}))
      }
    })
  })
}
