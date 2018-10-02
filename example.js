const axios = require('axios')

const http = axios.create()
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


http.get(url, {
  params:{
    track: 'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp3', // could be ['url']
    ...waveformOptions
  }
})
  .then((res) => console.log(res))
  .catch(err => {
    console.log(err)
    return null
  })



