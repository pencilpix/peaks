const axios = require('axios')


const urls = [
  // mongo <dbname> --eval "db.dropDatabase()"
  'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp3',
  'http://jplayer.org/audio/mp3/Miaow-07-Bubble.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/01-dead-wrong-intro.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/02-juicy-r.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/01-dead-wrong-intro.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/03-its-all-about-the-crystalizabeths.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/04-islands-is-the-limit.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/05-one-more-chance-for-a-heart-to-skip-a-beat.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/06-suicidal-fantasy.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/07-everyday-shelter.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/07-everyday-shelter.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/08-basic-hypnosis.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/09-infinite-victory.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/10-the-curious-incident-of-big-poppa-in-the-nighttime.mp3',
  'http://kolber.github.io/audiojs/demos/mp3/11-mo-stars-mo-problems.mp3',
]

const http = axios.create()
const url = 'http://localhost:2500/peaks/single'
const waveformOptions = {
  barGap: 2,
  barWidth: 2,
  height: 128,
  width: 1200,
  waveColor: 'red',
  maxWidth: 4000,
  pxRatio: 2,
  numOfSample: 1800,
  waveformType: 1,
  force: true,
}

http.get(url, { params: { ...waveformOptions, track: 'http://kolber.github.io/audiojs/demos/mp3/10-the-curious-incident-of-big-poppa-in-the-nighttime.mp3' } })
  .then(res => console.log(res))
