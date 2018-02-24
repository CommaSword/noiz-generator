'use strict'

const fs = require('fs')
const createAudio = require('./lib/node-audio-element.js')

function isAudioFile (filename) {
  return /\.mp3$/.test(filename)
}

module.exports = {
  async noiseGenerator (dir) {
    const Audio = createAudio()
    const files = fs.readdirSync(dir)
    const audioFileNames = files.filter(isAudioFile)
    const audioFiles = await Promise.all(
      audioFileNames.map(async filename => {
        const aud = new Audio(`${dir}/${filename}`)
        try {
          await aud.play()
          await aud.loop(true)
          return aud
        } catch (e) {
          throw new Error('timed out waiting for electron process')
        }
      })
    )
    return (...volumes) => {
      if (volumes.length !== audioFiles.length) {
        throw new Error(
          `invalid argument length, received ${volumes.length} but have ${audioFiles.length} files loaded`
        )
      }
      return Promise.all(
        volumes.map((value, i) => {
          return audioFiles[i].volume(value)
        })
      ).catch((e) => {
        throw new Error('timed out waiting for electron process')
      })
    }
  }
}
