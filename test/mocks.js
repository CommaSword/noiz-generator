'use strict'

const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

module.exports = {
  mockNoiseGenerator (electronSpawn) {
    function returnSpawn () {
      return electronSpawn
    }
    returnSpawn['@global'] = true
    return proxyquire('../', {
      'electron-spawn': returnSpawn
    })
  },
  mockElectronApp (electronSpawn, AudioSpy) {
    global.Audio = AudioSpy
    return proxyquire('../lib/electron', {
      'electron': {
        remote: {
          process: electronSpawn
        }
      }
    })
  },
  mockDomAudioApi () {
    const play = sinon.spy()
    const loop = sinon.spy()
    const volume = sinon.spy()
    const api = new Proxy({play}, {
      set: (oTarget, target, val) => {
        if (target === 'loop') loop()
        if (target === 'volume') volume(val)
        oTarget[target] = val
        return true
      }
    })
    return {play, loop, volume, api}
  }
}
