const waveform = require('waveform-node')
const ffmpeg = require('ffmpeg-static')
const axios = require('axios')
const save = require('save-file')
const tmp = require('tmp')
const { resolve } = require('path')
const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;


const DEFAULTS = {
  ffmpegPath: ffmpeg.path,
  numOfSample: 1800,
  waveformType: 1,
}


const $http = axios.create({
  responseType: 'arraybuffer',
})


/**
 * check if url is valid
 * @param {String} url
 * @returns {Boolean}
 */
const isValid = url => urlPattern.test(url)


/**
 * check if array of urls has valid urls
 * @param {Array<String>} urls
 * @returns {Boolean}
 */
const isValidList = urls => urls.reduce((cur, next) => cur && isValid(next), true)


/**
 * handle error
 * @param {Object} stack error stack
 * @param {String} message log message of error
 * @param {Number} code error number
 * @param {String} status='error' error type
 * @returns {Object}
 */
const handleErr = (stack, message, code = 500, status = 'error') => ({ status, code, stack, message })


/**
 * clear the options if there is key value undefined
 * @param {Object} options waveform-node options
 * @returns {Object}
 */
const clearOptions = options => Object.keys(options)
  .filter(key => options[key] !== null && typeof options[key] !== undefined)
  .reduce((cur, next) => Object.assign({}, cur, { [next]: options[next] }), {})



/**
 * get peaks for audio file
 * @param {String} track audio file url
 * @param {Object} options waveform-node options
 * @returns {Promise} Object<track: 'url', peaks: []>/error
 */
const getPeaks = (track, options) => {
  return new Promise((resolve, reject) => {
    tmp.file((err, path, fd, cleanup) => {
      if (err) reject(handleErr(err && err.stack, 'error when parsing: ' + track))

      console.log(typeof track, track)

      $http.get(track)
        .then(({ data }) => save(data, path, (saveErr, data) => {
          if (saveErr) {
            reject(handleErr(saveErr && saveErr.stack, 'error when saveing: ' + track))
          }

          waveform.getWaveForm(path, options, function(error, peaks) {
            if(error) {
              reject(handleErr(error && error.stack, 'error while trying to get peaks of: ' + track))
            }

            cleanup()
            resolve({ track, peaks })
          })
        })).catch(error => {
          cleanup()
          reject(handleErr(error && error.stack, 'error while fetching: ' + track))
        })
    })
  })
}



/**
 * fetch list of audio file peaks
 * @param {HTTPResponse} res express http response
 * @param {Array<String>} tracks list of tracks urls
 * @param {Object} options waveform-node options
 */
const getPeaksList = (res, tracks, options) => {
  const _options = Object.assign({}, DEFAULTS, clearOptions(options))

  Promise.all(tracks.map((track) => getPeaks(track, options)))
    .then((list) => res.status(200).json(list.length === 1 ? list[0] : list))
    .catch((err) => res.status(err && err.code).json(err))
}



/**
 * middleware to handle get /peaks requests
 */
module.exports = function peaksMiddleware(req, res, next) {
  let { track, numOfSample, waveformType, samplesPerSecond } = req.body
  track = track || req.query.track
  numOfSample = numOfSample || req.query.numOfSample
  waveformType = typeof waveformType !== 'undefined' ? waveformType : req.query.waveformType
  samplesPerSecond = samplesPerSecond || req.query.samplesPerSecond

  if (Array.isArray(track) && isValidList(track)) {
    getPeaksList(res, track, { numOfSample, waveformType, samplesPerSecond });
  } else if (typeof track === 'string' && isValid(track)) {
    getPeaksList(res, [track], { numOfSample, waveformType, samplesPerSecond })
  } else {
    res.status(400)
      .json({
        status: 'error',
        code: 400,
        message: 'track attribute must be a valid url or an array of valid urls',
      })
  }
}
