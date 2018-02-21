'use strict'

const fs = require('fs')
const createAudio = require('./lib/node-audio-element.js')

function isAudioFile (filename) {
  // TODO: properly
  return /\.mp3$/.test(filename)
}

module.exports = {
  noiseGenerator (dir) {
    const Audio = createAudio()
    const files = fs.readdirSync(dir)
    const audioFileNames = files.filter(isAudioFile)
    const audioFiles = audioFileNames.map(filename => {
      const aud = new Audio(`${dir}/${filename}`)
      aud.play()
      aud.loop = true
      return aud
    })
    return (...volumes) => {
      if (volumes.length !== audioFiles.length) {
        throw new Error(
          `invalid argument length, received ${volumes.length} but have ${audioFiles.length} files loaded`
        )
      }
      volumes.forEach((value, i) => {
        audioFiles[i].volume = value
      })
    }
  }
}
