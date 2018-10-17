const waveform = require('waveform-node')
const ffmpeg = require('ffmpeg-static')
const axios = require('axios')
const save = require('save-file')
const fs = require('fs')
const { resolve } = require('path')
const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const Canvas = require('./canvas')
const Peaks = require('./model')
const settings = require('./settings.js')

const canvas = new Canvas()


const DEFAULTS = {
  ffmpegPath: ffmpeg.path,
  numOfSample: 1800,
  waveformType: 1,
  barGap: 1,
  barWidth: 1,
  height: 128,
  width: 1400,
  waveColor: '#757575',
  maxWidth: 4000,
  pxRatio: 2,
  force: false,
  list:false,
}


const $http = axios.create({
  responseType: 'arraybuffer',
  timeout: 20000,
  onDownloadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
    console.log(progressEvent);
  },
})


/**
 * check if url is valid
 * @param {String} url
 * @returns {Boolean}
 */
const isValid = url => urlPattern.test(url) || /localhost/.test(url)


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

const cleanup = (file) => {
  try {
    fs.unlink(file)
    return true
  } catch (err) {
    return null
  }
}

const isFile = (filePath) => {
  let found = true

  try {
    found = fs.lstatSync(filePath).isFile()
  } catch (err) {
    found = false
  }

  return found
}

/**
 * get peaks for audio file
 * @param {String} track audio file url
 * @param {Object} options waveform-node options
 * @returns {Promise} Object<track: 'url', peaks: []>/error
 */
const getPeaks = (track, options) => {
  const tempFile = resolve(__dirname, './temp/tmp')


  return new Promise((resolve, reject) => {
    $http.get(track).then(({ data }) => save(data, tempFile, (saveErr, data) => {
      if (saveErr) {
        if (isFile(tempFile)) cleanup(tempFile)
        return handleErr(saveErr && saveErr.stack, 'error when saving: ' + track)
      }

      waveform.getWaveForm(tempFile, options, function(error, peaks) {
        if(error) {
        if (isFile(tempFile)) cleanup(tempFile)
          return reject(handleErr(error && error.stack, 'error while trying to get peaks of: ' + track))
        }
        if (isFile(tempFile)) cleanup(tempFile)
        return resolve({ track, peaks })
      })
    })).catch(error => {
      if (isFile(tempFile)) cleanup(tempFile)
      return reject(handleErr(error && error.stack, 'error while fetching: ' + track))
    })
  })
}



/**
 * fetch list of audio file peaks
 * @param {HTTPResponse} res express http response
 * @param {Array<String>} tracks list of tracks urls
 * @param {Object} options waveform-node options
 */
const getPeaksList = (res, track, options, existUrl) => {
  return getPeaks(track, options)
    .then((data) => {
      const { track, peaks } = data
      const newRes = {}
      canvas.updateOptions(options)
      data.image = canvas.createWaveImage(peaks)

      if (!existUrl) {
        Peaks.addPeaks(data, (err, trackData) => {
          if (err) throw err
          newRes._id = trackData.id
          newRes.__v = trackData.__v
          newRes.track = trackData.track
          newRes.image_url = settings.appUrl + '/peaks/wave/' + trackData.id
          newRes.peaks_url = settings.appUrl + '/peaks/list/' + trackData.id

          if (options.list) {
            newRes.peaks = trackData.peaks
          }
          res.json(newRes)
        })
      // return res.status(200).json(list.length === 1 ? list[0] : list)
      } else {
        Peaks.updatePeaks(existUrl, data, (err, trackData) => {
          if (err) throw err
          newRes._id = trackData.id
          newRes.__v = trackData.__v
          newRes.track = trackData.track
          newRes.image_url = settings.appUrl + '/peaks/wave/' + trackData.id
          newRes.peaks_url = settings.appUrl + '/peaks/list/' + trackData.id

          if (options.list) {
            newRes.peaks = trackData.peaks
          }
          res.json(newRes)
        })
      }
    })
    .catch((err) => res.status(err && err.code).json(err))
}



/**
 * middleware to handle get /peaks requests
 */
module.exports = function peaksMiddleware(req, res, next) {
  /*
  let { track, numOfSample, waveformType, force, samplesPerSecond } = req.body
  let opts = {}
  track = track || req.query.track
  force = force || req.query.force
  numOfSample = numOfSample || req.query.numOfSample
  waveformType = typeof waveformType !== 'undefined' ? waveformType : req.query.waveformType
  samplesPerSecond = samplesPerSecond || req.query.samplesPerSecond


  opts = {
    ...req.body,
    ...req.query,
    numOfSample,
    waveformType,
    samplesPerSecond,
    force,
  }
  */
 const opts = Object.assign({}, DEFAULTS, req.body, req.query)
 const { track, force } = opts


if (typeof track === 'string' && isValid(track)) {
  Peaks.getPeaksByUrl(track, opts.list, (err, data) => {
    if (err) throw err

    if (data) {
      data.image_url = settings.appUrl + '/peaks/wave/' + data.id
      data.peaks_url = settings.appUrl + '/peaks/list/' + data.id
      if (!force) {
        res.json(data)
      } else {
        getPeaksList(res, track, opts, data.track)
      }
    } else {
      getPeaksList(res, track, opts)
    }
  })
  } else {
    res.status(400)
      .json({
        status: 'error',
        code: 400,
        message: 'track attribute must be a valid url',
      })
  }
}
