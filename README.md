# noise-generator
Generate background noise with varying volume (work in progress)

## usage

```javascript
const { noiseGenerator } = require('noise-generator')

const dir = '/path/to/mp3' // dir contains two mp3 files
const noise = noiseGenerator(dir)

noise(0.5, 0.5) // set both files at 50% volume
noise(0, 1) // mute first file and set second file to 100% volume

// ...or whatever
for (let i = 0; i < 10000; i++) {
  setTimeout(() => {
    noise(1, Math.random())
  }, i * 100)
}

```

## status

Check out the issues to follow the progress
