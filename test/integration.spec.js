'use strict'

const test = require('tape')
const { PassThrough } = require('stream')
const sinon = require('sinon')
const {
  mockNoiseGenerator,
  mockElectronApp,
  mockDomAudioApi
} = require('./mocks')
const { mp3DataUri, receiveMessageCount } = require('./utils')

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
    const receivedSixMessages = receiveMessageCount(6, electronSpawn.stdin)
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    noiseGenerator(`${__dirname}/fixtures`)
    await receivedSixMessages // instantiate 2 files: 2 opens, 2 plays, 2 loops
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
    const receivedEightMessages = receiveMessageCount(8, electronSpawn.stdin)
    const { noiseGenerator } = mockNoiseGenerator(electronSpawn)
    mockElectronApp(electronSpawn, AudioSpy)()
    const noise = noiseGenerator(`${__dirname}/fixtures`)
    noise(0.5, 0.7)
    await receivedEightMessages // instantiate + 2 volume messages
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
    const noise = noiseGenerator(`${__dirname}/fixtures`)
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
    const noise = noiseGenerator(`${__dirname}/fixtures`)
    t.throws(
      () => noise(0.5),
      /invalid argument length, received 1 but have 2 files loaded/
    )
  } catch (e) {
    t.fail(e)
    t.end()
  }
})
