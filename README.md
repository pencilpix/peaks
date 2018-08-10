# Audio Files Peaks Generator.

it depends on `ffmpeg` and `canvas`. please be sure you have it on the machine before use this server.

### installation

clone or download this repo

### usage

1. be sure you have `ffmpeg` is installed at your machine.
2. install requirments of node [canvas](https://github.com/Automattic/node-canvas#compiling)
3. `cd /path/to/repo/clone`
4. `npm install` or `yarn`
5. `yarn run start`
6. now you can make get request as follow

```js
const url = 'http://localhost:2500/peaks'
const waveformOptions = {
  barGap: 2,
  barWidth: 2,
  height: 128,
  width: 1200,
  waveColor: '#757575',
  maxWidth: 4000,
  pxRatio: 2,
  numOfSample: 1800,
  waveformType: 1,
}


axios.get(url, {
  track: 'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp3', // could be ['url']
  ...waveformOptions
})

// -> response { track: 'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp3', image: 'data:image/png;base64...', peaks: [0.324, 0.3243, ....]}
```

