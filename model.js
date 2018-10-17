const mongoose = require('mongoose')
const Schema = mongoose.Schema

const peaksSchema = new Schema({
  track: {
    type: String,
    required: true,
  },
  peaks: {
    type: [Number],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: false,
  },

  peaks_url: {
    type: String,
    required: false,
  }
})


const Peaks = mongoose.model('PeaksModel', peaksSchema)


module.exports = Peaks

module.exports.getPeaks = function (limit, callback) {
  Peaks.find({},{ image: 0, peaks: 0 }, callback, limit)
}

module.exports.getPeaksByUrl = function (track, list, callback) {
  const projection = { image: 0 }
  if (!list) {
    projection.peaks = 0
  }
  Peaks.findOne({ track }, projection, callback)
}

module.exports.addPeaks = function (peaks, callback) {
  Peaks.create(peaks, callback)
}

module.exports.updatePeaks = function (track, peaks, callback) {
  Peaks.findOneAndUpdate({ track }, peaks, { upsert: true, fields: { image: 0, peaks: 0 } }, callback)
}

module.exports.getPeaksWave = function(id, callback) {
  Peaks.findById(id, 'image', callback)
}

module.exports.getPeaksList = function (id, callback) {
  Peaks.findById(id, 'peaks', callback)
}
