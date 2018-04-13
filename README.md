# Audio Files Peaks Generator.

it depends on ffmpeg. please be sure you have it on the machine before use this server.

### installation

clone or download this repo

### usage

1. be sure you have `ffmpeg` is installed at your machine.
2. `cd /path/to/repo/clone`
3. `npm install` or `yarn`
4. `yarn run start`
5. now you can make get request as follow

```js
const url = 'http://localhost:2500/peaks'track=
const waveformOptions = {

}
axios.get(url, {
  track: 'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp30', // could be ['url']
  ...waveformOptions
})

// -> response { track: 'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp30', peaks: [0.324, 0.3243, ....]}
```

