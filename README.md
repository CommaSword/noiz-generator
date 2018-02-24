# noise-generator
Generate background noise with varying volume (work in progress)

## usage

```javascript
const { noiseGenerator } = require('./')

const dir = '/path/to/mp3'; // dir contains two mp3 files

(async () => {
  const noise = await noiseGenerator(dir)
  await noise(0.5, 0.5) // set both files at 50% volume
  await noise(0, 1) // mute first file and set second file to 100% volume

  // ...or whatever
  for (let i = 0; i < 10000; i++) {
    await noise(Math.random(), Math.random())
    await new Promise(resolve => setTimeout(resolve, 100))
  }
})()

```

## status

Check out the issues to follow the progress
