'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

test('Instantiating plays files', async t => {
  try {
    t.plan(4)
    const play = sinon.spy()
    const loop = sinon.spy()
    const Audio = sinon.stub().returns({play, loop})
    const createAudio = sinon.stub().returns(Audio)
    const { noiseGenerator } = proxyquire('../', {'node-mp3-player': {createAudio}})
    await noiseGenerator(`${__dirname}/fixtures`)
    t.equals(
      Audio.args[0][0],
      `${__dirname}/fixtures/bar.mp3`,
      'first mp3 file created'
    )
    t.equals(
      Audio.args[1][0],
      `${__dirname}/fixtures/foo.mp3`,
      'second mp3 file created'
    )
    t.ok(play.calledTwice, 'Both audio files played')
    t.ok(loop.calledTwice, 'Both audio files looped')
  } catch (e) {
    console.log('e:', e)
    t.fail(e)
    t.end()
  }
})

test('Can change volume of all files', async t => {
  try {
    t.plan(2)
    const play = sinon.spy()
    const loop = sinon.spy()
    const volume = sinon.spy()
    const Audio = sinon.stub().returns({play, loop, volume})
    const createAudio = sinon.stub().returns(Audio)
    const { noiseGenerator } = proxyquire('../', {'node-mp3-player': {createAudio}})
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    await noise(0.5, 0.7)
    t.equals(volume.args[0][0], 0.5, 'volume called once with 0.5')
    t.equals(volume.args[0][0], 0.5, 'volume called once with 0.7')
  } catch (e) {
    console.log('e:', e)
    t.fail(e)
    t.end()
  }
})

test('ERROR - sending too many arguments throws', async t => {
  try {
    t.plan(1)
    const play = sinon.spy()
    const loop = sinon.spy()
    const volume = sinon.spy()
    const Audio = sinon.stub().returns({play, loop, volume})
    const createAudio = sinon.stub().returns(Audio)
    const { noiseGenerator } = proxyquire('../', {'node-mp3-player': {createAudio}})
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    t.throws(
      () => noise(1, 1, 1),
      /invalid argument length, received 3 but have 2 files loaded/,
      'proper error shown'
    )
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - sending too few arguments throws', async t => {
  try {
    t.plan(1)
    const play = sinon.spy()
    const loop = sinon.spy()
    const volume = sinon.spy()
    const Audio = sinon.stub().returns({play, loop, volume})
    const createAudio = sinon.stub().returns(Audio)
    const { noiseGenerator } = proxyquire('../', {'node-mp3-player': {createAudio}})
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    t.throws(
      () => noise(1),
      /invalid argument length, received 1 but have 2 files loaded/,
      'proper error shown'
    )
  } catch (e) {
    t.fail(e)
    t.end()
  }
})

test('ERROR - Audio error is forwarded properly', async t => {
  try {
    t.plan(1)
    const play = sinon.spy()
    const loop = sinon.spy()
    const volume = sinon.spy()
    const Audio = sinon.stub().returns({play, loop, volume})
    const createAudio = sinon.stub().returns(Audio)
    const { noiseGenerator } = proxyquire('../', {'node-mp3-player': {createAudio}})
    const noise = await noiseGenerator(`${__dirname}/fixtures`)
    t.throws(
      () => noise(1),
      /invalid argument length, received 1 but have 2 files loaded/,
      'proper error shown'
    )
  } catch (e) {
    t.fail(e)
    t.end()
  }
})
