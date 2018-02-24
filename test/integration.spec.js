'use strict'

const test = require('tape')
const { PassThrough } = require('stream')
const sinon = require('sinon')
const {
  mockNoiseGenerator,
  mockElectronApp,
  mockDomAudioApi
} = require('./mocks')
const { mp3DataUri } = require('./utils')

test('Instantiating plays files', async t => {
  try {
    t.plan(4)
    const expected = {
      foo: mp3DataUri(`${__dirname}/fixtures/foo.mp3`),
      bar: mp3DataUri(`${__dirname}/fixtures/bar.mp3`)
    }
    const { play, loop, api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    await noiseGenerator(`${__dirname}/fixtures`)
    t.equals(AudioSpy.args[0][0], expected.bar, 'AudioSpy called with uri of second sound file')
    t.equals(AudioSpy.args[1][0], expected.foo, 'AudioSpy called with uri of second sound file')
    t.ok(play.calledTwice, 'play command called for both files')
    t.ok(loop.calledTwice, 'loop set on both files')
    // TODO: make sure mock calls are unique per file
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('Can change volume on the fly', async t => {
  try {
    t.plan(2)
    const { volume, api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    await noise(0.5, 0.7)
    t.equals(volume.args[0][0], 0.5, 'volume set to 0.5 on first file')
    t.equals(volume.args[1][0], 0.7, 'volume set to 0.7 on second file')
    // TODO: make sure mock calls are unique per file
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - sending too many args throws', async t => {
  try {
    t.plan(1)
    const { api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    t.throws(
      () => noise(0.5, 0.7, 0.1),
      /invalid argument length, received 3 but have 2 files loaded/
    )
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - sending too few args throws', async t => {
  try {
    t.plan(1)
    const { api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    t.throws(
      () => noise(0.5),
      /invalid argument length, received 1 but have 2 files loaded/
    )
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - play command times out properly', async t => {
  try {
    t.plan(1)
    const { api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    electronSpawn.stdout._transform = function (data, encoding, callback) {
      const obj = JSON.parse(data)
      if (obj.play) {
        callback(null, '{}')
      } else {
        callback(null, data)
      }
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    try {
      await noiseGenerator(`${__dirname}/fixtures`),
      t.fail('did not throw when play hangs')
    } catch (e) {
      t.equals(e.message, 'timed out waiting for electron process', 'proper message thrown')
    }
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - loop command times out properly', async t => {
  try {
    t.plan(1)
    const { api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    electronSpawn.stdout._transform = function (data, encoding, callback) {
      const obj = JSON.parse(data)
      if (obj.loop) {
        callback(null, '{}')
      } else {
        callback(null, data)
      }
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    try {
      await noiseGenerator(`${__dirname}/fixtures`),
      t.fail('did not throw when loop hangs')
    } catch (e) {
      t.equals(e.message, 'timed out waiting for electron process', 'proper message thrown')
    }
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - volume command times out properly', async t => {
  try {
    t.plan(1)
    const { api } = mockDomAudioApi()
    const AudioSpy = sinon.stub().returns(api)
    const electronSpawn = {
      stdin: PassThrough({objectMode: true}),
      stderr: PassThrough({objectMode: true}),
      stdout: PassThrough({objectMode: true})
    }
    electronSpawn.stdout._transform = function (data, encoding, callback) {
      const obj = JSON.parse(data)
      if (obj.volume) {
        callback(null, '{}')
      } else {
        callback(null, data)
      }
    }
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    try {
      await noise(0.5, 0.2)
      t.fail('did not throw when volume hangs')
    } catch (e) {
      t.equals(e.message, 'timed out waiting for electron process', 'proper message thrown')
    }
  } catch (e) {
    t.fail(e)
    t.end()
  }
})
