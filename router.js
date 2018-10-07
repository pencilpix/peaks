const express = require('express')
const router = express.Router()
const Peaks = require('./model.js')
const middleware = require('./middleware.js')
const settings = require('./settings.js')


/**
 * get peaks of an audio file
 * it accept body { track: 'http://domain/audio-file.mp3' }
 */
router.get('/peaks', (req, res) => {
  const limit = req.query.limit || 5
  Peaks.getPeaks(limit, (err, list) => {
    if (err) throw err

    list.forEach(doc => {
      const peaks_url = settings.appUrl + '/peaks/list/' + doc._id
      const image_url = settings.appUrl + '/peaks/wave/' + doc._id
      doc.set({ peaks_url, image_url })
    })

    res.json(list)
  }, limit)
})



router.get('/peaks/single', middleware)




router.get('/peaks/wave/:id', (req, res) => {
  Peaks.getPeaksWave(req.params.id, (err, track) => {
    let buf = null
    if (err) throw err

    buf = new Buffer(track.image.replace(/^data:image\/png;base64,/, ""), 'base64')
    res.setHeader('Content-Type', 'image/png')
    res.end(buf)
  })
})




router.get('/peaks/list/:id', (req, res) => {
  Peaks.getPeaksList(req.params.id, (err, track) => {
    if (err) throw err
    res.json(track.peaks)
  })
})


module.exports = router
