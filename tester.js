const noiseGenerator = require('./')

const dir = `${__dirname}/mp3` // dir contains two mp3 files
const noise = noiseGenerator(dir)

// ...or whatever
for (let i = 0; i < 10000; i++) {
  setTimeout(() => {
    noise(1, Math.random())
  }, i * 100)
}
