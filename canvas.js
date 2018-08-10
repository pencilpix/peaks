const { createCanvas, loadImage } = require('canvas')

const DEFAULTS = {
  barGap: null,
  barWidth: 2,
  height: 128,
  waveColor: '#757575',
  maxWidth: 4000,
  pxRatio: 2,
}



module.exports = class Canvas {
  constructor(opts) {
    this.opts = Object.assign({}, DEFAULTS, opts)
    this.width = this.opts.width
    this.height = this.opts.height
    this.canvas = createCanvas(this.width, this.height)
    this.ctx = this.canvas.getContext('2d')
    this.peaks = []
    this.pxRatio = this.opts.pxRatio || 1
    this.halfPixel = 0.5 / this.pxRatio
  }


  createWaveImage(peaks) {
    this.peaks = peaks || []
    this.clear(0, 0, this.width, this.height)
    this.drawBars(0, this.width)
    this.fillBg(this.opts.waveColor)

    return this.canvas.toDataURL()
  }


  updateOptions(opts) {
    this.opts = Object.assign({}, DEFAULTS, opts)
    this.opts.pxRatio = Number(this.opts.pxRatio)
    this.opts.barWidth = Number(this.opts.barWidth)
    this.opts.barGap = Number(this.opts.barGap)
    this.width = Number(this.opts.width)
    this.height = Number(this.opts.height)
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.pxRatio = this.opts.pxRatio || 1
    this.halfPixel = 0.5 / this.pxRatio
  }


  fillBg(clr) {
    this.clear(0, 0, this.width, this.height)
    this.fill(0, 0, this.width, this.height, clr)
  }



  drawBars(start, end) {
    return this.prepareDraw(0, start, end, (arg) => {
      const { absmax, hasMinValue, height, offsetY, halfH, peaks } = arg
      const peaksIndexScale = hasMinValue ? 2 : 1
      const length = peaks.length / peaksIndexScale
      const bar = this.opts.barWidth * this.pxRatio
      const noBarGap = Math.max(this.pxRatio, ~~(bar / 2))
      const barGap = Math.max(this.pxRatio, this.opts.barGap * this.pxRatio)
      const gap = this.opts.barGap === null ? noBarGap : barGap
      const step = (bar + gap)
      const scale = length / (this.width)
      if (typeof start === 'undefined') return

      for (let i = start; i < end; i += step) {
        const peak = peaks[Math.floor(i * scale * peaksIndexScale)] || 0
        const h = Math.round(peak / absmax * halfH)
        this.createRect(i + this.halfPixel, halfH - h + offsetY, bar + this.halfPixel, h * 2)
      }
      this.ctx.clip()
    })
  }


  prepareDraw(channelIndex, start, end, fn = () => {}) {
    const { height, peaks } = this
    //const absmax = 1
    const hasMinValue = peaks.some(p => p < 0)
    // should be used if we need to normalize
    const { min, max } = this.getMaxMin(peaks)
    const absmax = -min > max ? -min : max // normalized max.
    const offsetY = 0
    const halfH = height / 2

    return fn({ absmax, hasMinValue, height, offsetY, halfH, peaks })
  }



  clear(x = 0, y = 0, w = this.width, h = this.height) {
    this.ctx.clearRect(x, y, w, h)
  }


  createRect(x, y, width, height) {
    const maxWidth = Math.round(this.opts.maxWidth / this.pxRatio)
    const leftOffset = 0;
    const h = y + height
    const w = Math.min(x + width, maxWidth + this.width)
    this.drawRect(x, y, Math.min(x + width, 0 + this.width), y + height)
  }


  drawRect(x, y, width, height) {
    this.ctx.rect(x, y, width - x, height - y);
  }


  fill(x, y, width, height, clr) {
    this.ctx.fillStyle = clr
    this.ctx.fillRect(x, y, width, height)
  }

  getMaxMin(peaks) {
    let min = 0
    let max = 0

    peaks.forEach(peak => {
      if (peak < min) min = peak
      if (peak > max) max = peak
    })

    return { min, max }
  }
}

