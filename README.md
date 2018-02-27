# noiz-generator
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/CommaSword/noiz-generator.svg?branch=master)](https://travis-ci.org/CommaSword/noiz-generator)
[![Coverage Status](https://coveralls.io/repos/github/CommaSword/noiz-generator/badge.svg?branch=master)](https://coveralls.io/github/CommaSword/noiz-generator?branch=master)

Generate background noise with varying volume from a directory of mp3 files

## usage

```javascript
const { noiseGenerator } = require('noiz-generator')

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

## Contributing

Yes please!

## License
MIT
